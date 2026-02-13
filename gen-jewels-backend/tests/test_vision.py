import os
import base64
from groq import Groq
from dotenv import load_dotenv

# 1. Load Environment Variables
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

# 2. Initialize Groq Client
if not api_key:
    print("❌ ERROR: GROQ_API_KEY not found in .env file.")
    exit()

client = Groq(api_key=api_key)

def analyze_design_dna(image_path) -> str:
    """
    Reads a local image file and sends it to Groq Vision.
    """
    # 3. Validation
    if not os.path.exists(image_path):
        return f"❌ Error: File not found at {image_path}"

    # Determine media type based on file extension
    ext = os.path.splitext(image_path)[1].lower()
    media_type = "image/jpeg" # Default
    if ext == ".png":
        media_type = "image/png"
    elif ext == ".webp":
        media_type = "image/webp"

    print(f"📂 Reading image: {image_path} ({media_type})")

    try:
        # 4. Read and Encode Image
        with open(image_path, "rb") as image_file:
            image_bytes = image_file.read()
            base64_image = base64.b64encode(image_bytes).decode('utf-8')

        # 5. Construct Data URL
        data_url = f"data:{media_type};base64,{base64_image}"

        # 6. Send to Groq
        print("👀 Sending to Groq Vision API...")
        
        system_instruction = """
        Describe the physical TEXTURE, MATERIAL, and PATTERN of this jewelry item.
        Ignore the shape. Be extremely specific about the surface details.
        Output: Comma-separated keywords.
        """

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
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            temperature=0.1,
            max_tokens=200,
        )
        return completion.choices[0].message.content

    except Exception as e:
        return f"❌ Vision API Failed: {str(e)}"

# --- MAIN EXECUTION BLOCK ---
if __name__ == "__main__":
    # ⚠️ CHANGE THIS to your actual image filename
    TEST_IMAGE = "leaf 1.jpg" 
    
    # Check if user forgot to create the file
    if not os.path.exists(TEST_IMAGE):
        print(f"⚠️ Please place an image named '{TEST_IMAGE}' in this folder first!")
    else:
        result = analyze_design_dna(TEST_IMAGE)
        print("\n" + "="*40)
        print("🔮 RESULT FROM GROQ VISION:")
        print("="*40)
        print(result)
        print("="*40)