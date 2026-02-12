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
    Uses Groq Vision to extract textures/materials, IGNORING the shape.
    Accepts dynamic media_type to prevent API errors.
    """
    if not client:
        # Fallback if no API key
        return "Detailed organic texture with natural imperfections"

    # Encode image to Base64
    base64_image = base64.b64encode(image_bytes).decode('utf-8')

    system_instruction = """
    Act as a Senior 3D Visualization Specialist.
    Analyze the uploaded image. It is the "Source DNA" for a jewelry design.
    
    Your Output MUST focus ONLY on the physical texture, pattern, and material details.
    
    1. If it is a LEAF/NATURE: Describe the veins, dried edges, organic curves, and surface imperfections (waxy, brittle, serrated).
    2. If it is ARCHITECTURE: Describe the carvings, pillars, geometric patterns, and relief depth.
    3. If it is FABRIC/OTHER: Describe the weave, thread count, and tactility.
    
    DO NOT describe the background. DO NOT offer a preamble. 
    Just give me the raw forensic visual description of the surface.
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
                                # DYNAMICALLY INSERT THE CORRECT MIME TYPE HERE
                                "url": f"data:{media_type};base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            # Switched to 11b as it's often more stable for texture analysis
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
            temperature=0.1,
            max_tokens=300,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"❌ Vision Error: {e}")
        # BETTER FALLBACK: If vision fails, assume organic texture rather than generic gold
        return "High-fidelity organic texture with prominent veins and detailed relief"