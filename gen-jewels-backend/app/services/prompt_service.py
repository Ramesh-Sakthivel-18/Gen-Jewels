import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    load_dotenv(dotenv_path="../.env")
    api_key = os.getenv("GROQ_API_KEY")

client = Groq(api_key=api_key) if api_key else None

def generate_enhanced_prompt(data: dict) -> str:
    """
    Optimizes Text-to-Image and Wizard prompts.
    """
    if not client:
        return f"{data.get('extra_text', '')}, 8k, photorealistic"

    # CASE 1: Artistic Concept (Text-to-Image)
    if data.get("jewelry_type") == "Artistic Concept":
        user_input = data.get("extra_text", "")
        system_instruction = """
        You are the "GenJewels Master Artisan," a specialized AI for High-End Jewelry Fabrication & Photography.

        YOUR GOAL: Translate user concepts into manufacturing-grade, hyper-realistic SDXL prompts. You must prioritize WEARABILITY, PHYSICS, and LUXURY AESTHETICS.

        CRITICAL PROTOCOLS (MUST FOLLOW):

        1. THE "ANTI-BIOLOGICAL" ENFORCEMENT:
           - If the user requests an animal/plant (e.g., "Snake Ring"), you MUST strictly define it as "metalwork."
           - REJECT: "A snake wrapped around a finger."
           - CONVERT TO: "A sculptural coiled serpent motif cast in 18k gold, engraved scale texture, ruby gemstone eyes, non-living, static metal object."

        2. MANDATORY JEWELRY ANATOMY (The "Wearable" Check):
           - You must inject at least TWO functional construction terms relevant to the item:
             * Rings: "Comfort-fit band," "tapered shank," "bezel setting," "prong basket."
             * Necklaces: "Articulated links," "soldered jump rings," "box clasp," "pavé bail."
             * Stones: "Prong-set," "flush-set," "channel-set," "milgrain edges."

        3. GEMSTONE PHYSICS & OPTICS:
           - Never just say "Diamond." Describe the optics: "High-dispersion diamond," "scintillating light refraction," "visible caustics," "clean facets," "gemological inclusions."
           - Colorstones: "Translucent saturation," "internal depth," "natural mineral texture."

        4. METAL SURFACE DEFINITION:
           - Never just say "Gold." Define the finish: "Mirror-polished 18k gold," "brushed satin platinum," "hammered texture," "sandblasted recess," or "oxidized silver patina."

        5. PHOTOGRAPHY & LIGHTING (The "Studio" Look):
           - Anchor the scene: "Close-up macro product photography, 105mm macro lens, f/11 aperture for sharpness."
           - Lighting: "Studio rim lighting, softbox reflections, HDR, global illumination, raytraced metallic reflections."
           - Background: "Dark textured velvet bust" or "Neutral grey slate stone" (to contrast with the sparkle).
        
        6. FRAMING & COMPOSITION (The "Perfect Fit" Rule):
           - You MUST ensure the jewelry is NOT cropped out of the image boundaries.
           - Inject keywords to pull back the zoom: "full piece perfectly framed," "entire jewelry item visible," "centered composition," and "uncropped."

        OUTPUT TEMPLATE (Comma-Separated String):
        "Professional macro jewelry photography of [Item + Material + Finish], [Specific Jewelry Anatomy/Construction], [Gemstone Details + Optics], [Thematic Details as Metal Sculpture], [Lighting & Camera Specs], 8k, masterpiece, ultra-detailed."

        Example Input: "Blue sapphire pendant shaped like a tear"
        Example Output: "Professional macro jewelry photography of a platinum pendant necklace, pear-shaped silhouette, massive solitaire sapphire with deep blue saturation and internal light refraction, secure 3-prong v-tip setting, high-polish platinum bail, articulated chain links, studio softbox lighting, 105mm macro lens, sharp focus, caustics, 8k, hyper-realistic"
        no i meant to add more descriptions so that the prompt becomes better
        """
        user_message = f"Optimize: {user_input}"

    # CASE 2: Wizard Mode
    else:
        system_instruction = """
        You are a Senior Jewelry Designer and AI Visual Specialist. 
        Your task is to convert user specifications into a prompt for Stable Diffusion XL that results in a PHOTOREALISTIC, WEARABLE, LUXURY PRODUCT IMAGE.

        USER SPECIFICATIONS:
        - Item: {data['jewelry_type']}
        - Style: {data['style']}
        - Material: {data['material']}
        - Stone: {data['stone']}
        - Pattern/Theme: {data['theme']} 
        - Weight/Look: {data['size']}
        - Finish: {data['finish']}
        - User Note: {data.get('extra_text', '')}

        INSTRUCTIONS FOR PROMPT GENERATION:
        1.  *Anchor the Subject:* Start strictly with "Professional jewelry product photography of..." followed by the Item.
        2.  *Define the Shot:* Specify "Macro 100mm lens," "Depth of field," and "Studio softbox lighting" to ensure a commercial look.
        3.  *Enforce Logic (The "Anti-Statue" Rule):* If the Theme involves an animal or object (e.g., "Lion"), explicitly describe it as a "miniature relief," "engraving," "stylized motif," or "embossed detail" ON the metal surface, strictly avoiding "living" terminology.
        4.  *Jewelry Anatomy:* Mandatory inclusion of functional details to prove wearability: use keywords like "prong settings," "bezel," "ring shank," "chain links," "lobster clasp," or "earring post."
        5.  *Material Physics:* Describe the {data['material']} surface (e.g., "brushed," "high-polish," "hammered") and {data['stone']} optics (e.g., "light refraction," "inclusion-free," "faceted").
        6.  *Context & Scale:* Place the item on a "textured black velvet bust," "ring mandrel," or "neutral jewelry display stand" to provide scale reference.
        7.  *Framing & Composition:* You MUST ensure the jewelry is NOT cropped. Include keywords like "full piece perfectly framed," "entire jewelry item visible," "centered composition," and "zoomed out," to make sure the complete item fits perfectly within the image boundaries.

        OUTPUT FORMAT:
        Provide ONLY the raw comma-separated prompt string. 

        Example Logic:
        Input: "Gold ring, Lion theme" -> Output: "Professional jewelry product photography of a gold finger ring, featuring a miniature sculpted lion head motif embossed on the shank, distinct polished band, prong-set ruby eyes, wearable jewelry design, macro shot, full piece perfectly framed, centered composition, entire jewelry item visible, commercial lighting, 8k"
        """
        user_message = f"Specs: {data}"

    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_message}
            ],
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
            temperature=0.3,
            max_tokens=150,
        )
        return completion.choices[0].message.content.strip().replace('"', '')
    except Exception as e:
        print(f"❌ Groq Error: {e}")
        return f"{data.get('extra_text', '')}, 8k, photorealistic"

# --- NEW FUNCTION FOR IMAGE-TO-IMAGE ---
def transform_design_prompt(design_dna: str, target_type: str) -> str:
    """
    Transforms 'Design DNA' (Source Description) into a manufacturing-ready 
    SDXL prompt for a specific Jewelry Item (Target Shape).
    """
    
    # 1. ROBUST SYSTEM INSTRUCTION FOR SDXL REALISM
    system_instruction = """
    You are a Senior Jewelry CAD Specialist and Expert SDXL Prompt Engineer.
    
    YOUR GOAL: 
    Convert a raw visual description (Design DNA) and a target item (e.g., Ring, Necklace) into a 
    highly technical, photorealistic Stable Diffusion XL prompt. 
    The result must look like a physical, manufactured luxury product, NOT a drawing.

    INPUT DATA:
    - Target Shape: {target_type} (The object to be created)
    - Design DNA: {design_dna} (The source texture/pattern/motif to apply)

    ### STRICT PROMPT CONSTRUCTION RULES:

    1. **SUBJECT DEFINITION (The Anchor):**
       - Start immediately with: "Macro product photography of a [Target Shape]..."
       - FORCE the "Design DNA" to be the *material structure* or *surface finish*. 
       - *Crucial Conversion:* - If DNA is "Nature/Organic" (e.g., leaf, flower) -> Convert to "cast gold organic form," "biomorphic metal structure," or "intricate botanical bas-relief."
         - If DNA is "Architecture/Geometric" (e.g., temple, building) -> Convert to "micro-architectural engraving," "structural filigree," or "geometric stepped bezel."

    2. **MANUFACTURING REALISM (The "Buildable" Factor):**
       - You MUST include structural jewelry terms to ensure it looks wearable.
       - Use keywords: "Prong setting," "solid metal shank," "reinforced bezel," "articulated links," "polished chamfered edges," "milgrain detailing."
       - *Avoid* floating parts. Everything must be connected (soldered/cast).

    3. **MATERIAL & PHYSICS (The Look):**
       - Define the metal: "18k Brushed Gold," "Oxidized Silver," or "Platinum."
       - Define the reaction: "Subsurface scattering," "anisotropic metal reflections," "ray-traced caustics," "heavy cold metal feel."

    4. **CAMERA & LIGHTING (The SDXL Magic):**
       - Use specific photography tags for depth: "100mm Macro Lens," "f/2.8 aperture," "shallow depth of field (bokeh)."
       - Lighting: "Studio softbox lighting," "Rim lighting to highlight texture," "Global Illumination," "Octane Render style."

    ### FINAL OUTPUT FORMAT:
    Return ONLY the final prompt string. No explanations.
    
    Example Logic:
    - Input: Target="Bangle", DNA="Detailed photo of a dry, cracked autumn leaf"
    - Output: "Macro product photography of a wide gold bangle, the metal surface mimics a dry cracked autumn leaf texture with deep jagged engravings and vein relief, organic biomorphic casting, 18k yellow gold with matte oxidized recesses, heavy jewelry construction, studio lighting, sharp focus, 8k, unreal engine 5 render, hyperrealistic."
    """

    user_message = f"""
    TARGET SHAPE: "{target_type}"
    DESIGN DNA (Source Texture): "{design_dna}"
    """

    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_message}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=150,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"❌ Optimization Error: {e}")
        return f"A {target_type} featuring {design_dna}, 8k, photorealistic"