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
        MORE IMPORTANT : Return ONLY the raw comma-separated prompt string inside a code block. Strictly limit the output to 70 words or fewer.
        "Professional macro jewelry photography of [Item + Material + Finish], [Specific Jewelry Anatomy/Construction], [Gemstone Details + Optics], [Thematic Details as Metal Sculpture], [Lighting & Camera Specs], 8k, masterpiece, ultra-detailed."

        Example Input: "Bangle, Leaf theme, Rose Gold, Matte finish."
        Example Output: "Professional product photography of a rose gold bangle, full-frame centered composition, entire object visible, no cropping, sculpted organic leaf motif relief, matte brushed 18k metal texture, solid jewelry construction, ray-traced reflections, macro 85mm lens, f/4.0 deep focus, studio softbox lighting, high-end commercial finish, neutral jewelry stand, 8k, photorealistic, sharp focus."
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
        8.  *Return ONLY the raw comma-separated prompt string inside a code block. Strictly limit the output to 70 words or fewer.

        OUTPUT FORMAT:
        MORE IMPORTANT : Return ONLY the raw comma-separated prompt string inside a code block. Strictly limit the output to 70 words or fewer.
        Provide ONLY the raw comma-separated prompt string. 

        Eaxmple Login: 
        Input: Bangle, Leaf theme, Rose Gold, Matte finish.
        Output:
            Professional product photography of a rose gold bangle, full-frame centered composition, entire object visible, no cropping, sculpted organic leaf motif relief, matte brushed 18k metal texture, solid jewelry construction, ray-traced reflections, macro 85mm lens, f/4.0 deep focus, studio softbox lighting, high-end commercial finish, neutral jewelry stand, 8k, photorealistic, sharp focus.
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

# --- UPDATED FUNCTION FOR IMAGE-TO-IMAGE + INSTRUCTION ---
def transform_design_prompt(design_dna: str, target_type: str, user_instruction: str = None) -> str:
    """
    Takes 'Design DNA' (Texture) + 'Target Shape' + 'User Instruction'.
    The User Instruction overrides the DNA if they conflict.
    """
    if not client:
        return f"A {target_type} featuring {design_dna}, {user_instruction or ''}, 8k, photorealistic"

    system_instruction = """
    1. Role / Context
        Act as a Master Jewelry CAD Engineer and Senior SDXL Prompt Architect. You are an expert at "Material Translation"—converting organic "Source DNA" into high-end, manufacturable luxury jewelry. Your objective is to generate a prompt that results in a perfectly framed, physical product shot.

    2. Task / Instruction
        Synthesize the Target Shape (e.g., Ring, Bangle) and the Design DNA (VLM description) into a single technical prompt. You must also prioritize any User Instruction for specific materials or styles.
        The Transformation Rule: Convert all organic/nature descriptions into precious metals and gemstones.
        The "Jewelry-Only" Rule: The final output must be a solid jewelry item. No green leaves or real flowers—only the shape and texture translated into metal.
        The Alignment Rule: If the user query specifies a material (e.g., "Silver"), it overrides the colors found in the DNA.

    3. Input / Details & Constraints
        Full-Frame Composition: Include: "Full-frame composition," "centered subject," "entire object visible within the frame," and "no cropping."
        Subject Start: Start with: "Macro professional product photography of a [Target Shape]..."
        Structural Reality: Use: "Solid metal construction," "heavy shank," "seamless joints," and "reinforced bail."
        Material Physics: Define the metal precisely (18k Yellow Gold, Platinum, etc.) and specify "Ray-traced reflections" and "Anisotropic highlights."
        Photography Specs: "Shot on 85mm lens for natural proportions, f/4.0 for deep focus, studio softbox lighting, clean neutral background."

    4. Output Format
        MORE IMPORTANT : Return ONLY the raw comma-separated prompt string inside a code block. Strictly limit the output to 70 words or fewer.
        Return ONLY the final prompt string inside a code block. Do not provide any preamble.
        Example Logic for the AI:
        Input DNA: "A brittle, serrated leaf with complex vein structures."
        Target Shape: "Bangle."
        User Instruction: "Make it in Platinum."

            Your Output:   
                Professional product photography of a Platinum bangle, full-frame centered composition, entire object visible, no cropping, sculpted serrated leaf motif relief, deep vein engravings, solid jewelry construction, polished chamfered edges, ray-traced platinum reflections, macro 85mm lens, f/4.0 deep focus, studio softbox lighting, high-end commercial finish, neutral jewelry stand, 8k, hyper-realistic, sharp focus.
"""

    user_message = f"""
    Target Shape: "{target_type}"
    Source Design DNA (Texture): "{design_dna}"
    User Instruction (Override): "{user_instruction if user_instruction else 'None - follow DNA exactly'}"
    """

    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_message}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3, # Slightly creative to blend instructions
            max_tokens=200,
        )
        return completion.choices[0].message.content.strip()

    except Exception as e:
        print(f"❌ Optimization Error: {e}")
        return f"A {target_type} featuring {design_dna}, {user_instruction}, 8k, photorealistic"