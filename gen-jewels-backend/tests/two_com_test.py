import os
import torch
import gradio as gr
from diffusers import DiffusionPipeline
import ray

# ─── NETWORK CONFIGURATION ───
# Computer 2 IP (The Helper)
HELPER_IP = "10.10.110.178"
# Computer 1 IP (The Main PC - Your current machine)
MAIN_IP = "10.10.111.230"

# ─── PATH CONFIGURATION ───
# Ensure this folder exists on BOTH computers!
MODEL_CACHE = r"D:\ramesh\text jewelry\models_cache"
os.makedirs(MODEL_CACHE, exist_ok=True)

BASE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"
REFINER_MODEL = "stabilityai/stable-diffusion-xl-refiner-1.0"
LORA_PATH = r"D:\ramesh\text jewelry\fine tune\jewelry_lora\pytorch_lora_weights.safetensors"

# ─── 1) CONNECT TO THE CLUSTER ───
if not ray.is_initialized():
    print(f"🔄 Attempting to connect to Helper at {HELPER_IP}...")
    try:
        # We explicitly tell Ray who we are (MAIN_IP) to avoid 127.0.0.1 errors
        ray.init(
            address=f"ray://{HELPER_IP}:10001",
            _node_ip_address=MAIN_IP
        )
        print("✅ SUCCESS: Connected to Remote GPU Cluster!")
    except Exception as e:
        print(f"❌ ERROR: Could not connect to {HELPER_IP}")
        print("Did you run 'ray start ...' on Computer 2?")
        print("Did you allow Port 10001 through the Firewall?")
        raise e

# ─── 2) DEFINE REMOTE WORKER (Computer 2) ───
# This class will live entirely on the second computer
@ray.remote(num_gpus=1)
class RemoteRefiner:
    def __init__(self, model_id, cache_dir):
        print("🚀 REMOTE: Loading Refiner Model... (This may take time)")
        import torch
        from diffusers import DiffusionPipeline
        
        self.refiner = DiffusionPipeline.from_pretrained(
            model_id,
            cache_dir=cache_dir,
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True
        ).to("cuda")
        print("✅ REMOTE: Refiner Loaded & Ready!")
    
    def refine(self, latents, prompt):
        print(f"⚡ REMOTE: Refining image for prompt: {prompt[:20]}...")
        # The actual refining process
        image = self.refiner(
            prompt=prompt,
            num_inference_steps=40, # Reduced slightly for speed
            guidance_scale=7.5,
            denoising_start=0.8,    # High denoising since we are refining
            image=latents,
        ).images[0]
        return image

# ─── 3) LOAD LOCAL MODEL (Computer 1) ───
print("🖥️ LOCAL: Loading Base Model on Main GPU...")
pipe = DiffusionPipeline.from_pretrained(
    BASE_MODEL,
    cache_dir=MODEL_CACHE,
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True,
).to("cuda")

# Load LoRA if available
if os.path.isfile(LORA_PATH):
    print("💎 LOCAL: Loading Jewelry LoRA...")
    pipe.load_lora_weights(LORA_PATH, adapter_type="lora")
else:
    print(f"⚠️ WARNING: LoRA not found at {LORA_PATH}")

# ─── 4) INITIALIZE REMOTE WORKER ───
print("📡 INSTRUCTION: Waking up Computer 2...")
# This triggers the model download/load on Computer 2
refiner_actor = RemoteRefiner.remote(REFINER_MODEL, MODEL_CACHE)
# We call a dummy function just to wait until it's fully loaded before starting UI
print("⏳ Waiting for Computer 2 to be ready...")

# ─── GENERATION FUNCTION ───
def generate(prompt: str):
    print(f"\n🎨 Starting Generation: {prompt}")
    
    # STEP 1: Generate Latents Locally (Computer 1)
    # We use output_type="latent" to get raw data, not a PNG
    base_out = pipe(
        prompt=prompt,
        num_inference_steps=40, 
        guidance_scale=8.0,
        denoising_end=0.8,
        output_type="latent", 
    )
    latents = base_out.images

    # STEP 2: Send to Remote GPU (Computer 2)
    print("➡️ Sending data to Computer 2...")
    future = refiner_actor.refine.remote(latents, prompt)
    
    # STEP 3: Receive Result
    final_image = ray.get(future)
    print("✅ Image Received from Computer 2!")
    return final_image

# ─── GRADIO UI ───
with gr.Blocks() as demo:
    gr.Markdown(f"# 💎 Distributed Jewelry Generator")
    gr.Markdown(f"**Base + LoRA:** Local ({MAIN_IP}) | **Refiner:** Remote ({HELPER_IP})")
    
    with gr.Row():
        inp = gr.Textbox(label="Enter Prompt", placeholder="Gold necklace with ruby...")
        btn = gr.Button("Generate 🚀", variant="primary")
    
    out = gr.Image(label="Final Result")
    
    btn.click(generate, inputs=inp, outputs=out)

if __name__ == "__main__":
    # Server name 0.0.0.0 allows you to view this UI from other phones/laptops too
    demo.launch(server_name="0.0.0.0")