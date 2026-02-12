import asyncio
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from config.database import get_db
from app.schemas import DesignRequest, DesignResponse, DesignHistoryItem
from app.dependencies import get_current_user
from app.models import User, GeneratedDesign
from app.services.image_service import sd_service 

# Import services
from app.services.vision_service import analyze_design_dna
from app.services.prompt_service import generate_enhanced_prompt, transform_design_prompt

router = APIRouter(prefix="/generate", tags=["Jewelry Generation"])

@router.get("/history", response_model=List[DesignHistoryItem])
def get_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    designs = db.query(GeneratedDesign).filter(
        GeneratedDesign.user_id == current_user.id
    ).order_by(GeneratedDesign.created_at.desc()).all()
    return designs

@router.post("/", response_model=DesignResponse)
async def create_jewelry_design(  # ⚠️ Changed to async def
    request: DesignRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Standard Generation (Wizard & Text)
    print(f"🎨 User {current_user.username} Requesting: {request.jewelry_type}")
    
    # Run Groq prompt generation
    final_prompt = generate_enhanced_prompt(request.dict())
    
    # 4. Generate Image
    try:
        # ⚠️ CRITICAL FIX: Run the heavy AI math in a separate thread so /health doesn't block
        print("⏳ Passing task to background thread...")
        image_path = await asyncio.to_thread(sd_service.generate, final_prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image Gen Failed: {str(e)}")

    new_design = GeneratedDesign(
        user_id=current_user.id,
        jewelry_type=request.jewelry_type,
        style=request.style,
        material=request.material,
        stone=request.stone,
        gem_theme=request.theme,
        size_category=request.size,
        finish=request.finish,
        extra_text=request.extra_text,
        final_prompt=final_prompt,
        image_path=image_path
    )
    db.add(new_design)
    db.commit()

    return {"image_url": image_path, "final_prompt": final_prompt, "status": "success"}

# --- IMAGE TO IMAGE ENDPOINT ---
@router.post("/image-to-image", response_model=DesignResponse)
async def create_design_variation(
    init_image: UploadFile = File(...), 
    jewelry_type: str = Form(...),
    prompt: Optional[str] = Form(None),
    strength: float = Form(0.75),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"🔄 Image-to-Image: {current_user.username} -> {jewelry_type}")
    if prompt:
        print(f"📝 User Instructions: {prompt}")

    # 1. Read Image
    try:
        image_bytes = await init_image.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # 2. Extract DNA
    print(f"👀 Analyzing Design DNA for {init_image.filename} ({init_image.content_type})...")
    
    design_dna = analyze_design_dna(image_bytes, media_type=init_image.content_type)
    
    if not design_dna or "error" in design_dna.lower():
        design_dna = f"Texture inspired by {init_image.filename}, organic and detailed pattern"

    print(f"🧬 Extracted DNA: {design_dna}")

    # 3. Create Prompt
    print("✨ Creating New Prompt...")
    combined_dna = f"User Request: {prompt}. Visual details: {design_dna}" if prompt else design_dna
    
    final_prompt = transform_design_prompt(combined_dna, jewelry_type)
    print(f"🎨 Final Prompt: {final_prompt}")

    # 4. Generate
    try:
        # ⚠️ CRITICAL FIX: Run the heavy AI math in a separate thread so /health doesn't block
        print("⏳ Passing task to background thread...")
        image_path = await asyncio.to_thread(sd_service.generate, final_prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gen Failed: {str(e)}")

    # 5. Save
    extra_text_info = f"Instructions: {prompt}" if prompt else "No extra instructions"
    
    new_design = GeneratedDesign(
        user_id=current_user.id,
        jewelry_type=jewelry_type,
        style="Adapted",
        material="Original",
        stone="Original",
        gem_theme="Variation",
        size_category="Standard",
        finish="Original",
        extra_text=f"Variation Source: {extra_text_info}",
        final_prompt=final_prompt,
        image_path=image_path
    )
    db.add(new_design)
    db.commit()

    return {"image_url": image_path, "final_prompt": final_prompt, "status": "success"}