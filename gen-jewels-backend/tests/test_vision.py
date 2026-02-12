import os
import base64
from dotenv import load_dotenv
from groq import Groq

# 1. Load API Key
load_dotenv(dotenv_path="../.env")
api_key = os.getenv("GROQ_API_KEY")

# 2. Setup Client
client = Groq(api_key=api_key)

# 3. Path to your image
IMAGE_PATH = r"D:\ramesh\genjewels\gen-jewels-backend\tests\leaf 1.jpg"

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def analyze_image():
    if not os.path.exists(IMAGE_PATH):
        print(f"❌ Image not found at: {IMAGE_PATH}")
        return

    print("⏳ Analyzing with Groq (Deep Description Mode)...")
    
    try:
        base64_image = encode_image(IMAGE_PATH)

        chat_completion = client.chat.completions.create(
            # ⚡ Use the largest Vision model for best detail
            model="meta-llama/llama-4-maverick-17b-128e-instruct", 
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            # ⚡ NEW PROMPT FOR LONG DESCRIPTION ⚡
                            "text": """
                            Act as a Senior 3D Visualization Specialist and Material Curator.

                            I need a deep, forensic description of the primary subject in this image (whether it is a jewelry piece, a natural object like a leaf, or an architectural element like a temple gopuram). Your output will be used to recreate this exact item in 3D, so no detail is too small.

                            REQUIREMENTS:

                                1 .Write at least 10-15 lines of text.

                                2 .Do NOT use bullet points or comma-separated lists. Write in full, descriptive paragraphs.

                                3 .Focus on these layers (adapting to the specific subject):

                                4. Structural Geometry & Volumetrics: Describe the overall silhouette, curvature, thickness, weight distribution, and whether the structure is organic (flowing, irregular) or rigid (geometric, architectural).

                                5. Surface Materiality & Texture: Describe the exact finish and physical feel (e.g., 'waxy translucent cuticle with dried edges' for a leaf, 'rough weathered granite with moss patches' for stone, or 'brushed matte gold' for metal).

                                6. Focal Components & Color: Analyze the main features—such as specific gemstones, leaf veins, or sculpted statues. Describe their exact color codes, transparency, cut/shape, and how they sit within the main structure.

                                7. Micro-Detailing & Motifs: Describe the finest details (e.g., serrated edges, microscopic pores, floral carvings, or geometric engravings) and how they flow across the surface.

                            Start your description now: """
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            # ⚡ Increased Tokens to allow long answers
            max_tokens=2048, 
            temperature=0.6, # Slightly higher to allow creative description
            top_p=1,
            stream=False,
            stop=None,
        )

        print("\n" + "="*60)
        print("💎 DEEP FORENSIC ANALYSIS (LONG FORM):")
        print("="*60)
        print(chat_completion.choices[0].message.content)
        print("="*60)

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    analyze_image()