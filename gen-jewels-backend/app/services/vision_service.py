import os
import base64
from groq import Groq
from dotenv import load_dotenv

# Load API Key
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    load_dotenv(dotenv_path="../.env")
    api_key = os.getenv("GROQ_API_KEY")

client = Groq(api_key=api_key) if api_key else None

def analyze_design_dna(image_bytes, media_type="image/jpeg") -> str:
    """
    Uses Groq Vision to extract textures/materials.
    Handles MIME type validation to prevent 400 Errors.
    """
    if not client:
        return "Detailed organic texture with natural imperfections"

    # 1. Validate Media Type (Groq is strict)
    # If the frontend sent an unknown type, force it to 'image/jpeg' or 'image/png'
    valid_types = ["image/jpeg", "image/png", "image/webp"]
    if media_type not in valid_types:
        print(f"⚠️ Warning: Unsupported media_type '{media_type}'. Defaulting to 'image/jpeg'")
        media_type = "image/jpeg"

    # 2. Encode to Base64
    try:
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
    except Exception as e:
        print(f"❌ Base64 Encoding Failed: {e}")
        return "Standard gold metal texture"

    # 3. Construct Data URL
    data_url = f"data:{media_type};base64,{base64_image}"

    system_instruction = """
    1. Role / Context
        Act as a Senior 3D Jewelry Visualization Specialist. You are an expert at "Generative DNA Extraction"—the process of taking raw inspiration (Nature, Architecture, or existing Jewelry) and converting it into a technical blueprint for a new jewelry design.

    2. Task / Instruction
        Analyze the uploaded image.
        IF THE IMAGE IS JEWELRY: Provide a forensic technical deconstruction of its physical build.
        IF THE IMAGE IS NATURE/ARCHITECTURE (Source DNA): Describe the raw textures and patterns, then provide a "Jewelry Design Prompt" that translates those organic details into a specific piece of jewelry (Earring, Ring, Bangle, etc.).

    3. Input / Details & Constraints
        Strict Object Isolation: Ignore all background elements, skin, or props. Focus only on the "Source DNA."
        No Preamble: Do not say "I see an image of..." Start immediately with the analysis.
        Depth Inference: Describe how the 2D shapes would feel in 3D (thickness, curvature, relief).
        For Nature Images: Focus on veins, serrated edges, waxy/brittle textures, and how they translate to metal (e.g., "Translate these veins into 18k gold wire-work").

    4. Output Format
        [IDENTIFICATION]
        Source Type: (Jewelry / Nature / Architecture).
        Target Piece: (e.g., Statement Earring, Organic Cuff, Medallion Pendant).

        [PHYSICAL TOPOGRAPHY]
        Surface DNA: Describe the veins, carvings, or weave. Detail the "Highs" and "Lows."
        Edge Detail: (e.g., Raw/unrefined, Beveled, Knife-edged, or Tapered).
        Tactility: (e.g., Matte/Waxy, High-polish, Sand-blasted, or Hammered).

        [JEWELRY DESIGN PROMPT]
        (Provide a high-detail prompt for the next AI process)
        Format: "A [Jewelry Type] inspired by [Source DNA], featuring [Specific Texture] in [Metal Type], with [Specific Structure Details], isolated on a white studio background, 8k resolution, macro photography."
"""

    try:
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": system_instruction},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": data_url, 
                            },
                        },
                    ],
                }
            ],
            # Use the Vision model
            model="meta-llama/llama-4-maverick-17b-128e-instruct", 
            temperature=0.1, 
            max_tokens=200,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"❌ Vision Error: {e}")
        # This is the fallback string you saw in your logs
        return "High-fidelity organic texture with prominent veins and detailed relief"