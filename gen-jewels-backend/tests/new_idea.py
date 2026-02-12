import os, warnings
import torch
import gradio as gr
from diffusers import (
    DiffusionPipeline, 
    DPMSolverMultistepScheduler, 
    DPMSolverSDEScheduler
)

# ─── Silence benign warnings ───
warnings.filterwarnings("ignore", r"No LoRA keys associated to CLIPTextModel.*")
warnings.filterwarnings("ignore", r"No LoRA keys associated to CLIPTextModelWithProjection.*")

# ─── Configuration ───
MODEL_CACHE = r"D:\ramesh\text jewelry\models_cache"
os.makedirs(MODEL_CACHE, exist_ok=True)

BASE_MODEL    = "stabilityai/stable-diffusion-xl-base-1.0"
REFINER_MODEL = "stabilityai/stable-diffusion-xl-refiner-1.0"
LORA_PATH     = r"D:\ramesh\text jewelry\fine tune\jewelry_lora\pytorch_lora_weights.safetensors"

# ─── Sanity check ───
if not os.path.isfile(LORA_PATH):
    raise FileNotFoundError(f"LoRA weights not found at {LORA_PATH}")

# ─── 1) Load Base Model (The "Structure Builder") ───
print("Loading Base Model...")
pipe = DiffusionPipeline.from_pretrained(
    BASE_MODEL,
    cache_dir=MODEL_CACHE,
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True,
    local_files_only=False,
)

# OPTIMIZATION 1: Use "Fast Math" (DPM++ 2M Karras) for the Base
# This creates the ring shape very quickly.
pipe.scheduler = DPMSolverMultistepScheduler.from_config(
    pipe.scheduler.config,
    use_karras_sigmas=True,
    algorithm_type="dpmsolver++"
)

# Load LoRA
pipe.load_lora_weights(
    {os.path.basename(LORA_PATH): LORA_PATH},
    adapter_type="lora",
    local_files_only=True
)

# OPTIMIZATION 2: Smart CPU Offload (Saves VRAM)
pipe.enable_model_cpu_offload()

# OPTIMIZATION 3: xFormers (Speed Boost for RTX cards)
# If this causes an error, simply remove or comment out this line.
try:
    pipe.enable_xformers_memory_efficient_attention()
except Exception as e:
    print(f"Could not enable xFormers on Base: {e}")

# ─── 2) Load Refiner Model (The "Texture Polisher") ───
print("Loading Refiner Model...")
refiner = DiffusionPipeline.from_pretrained(
    REFINER_MODEL,
    cache_dir=MODEL_CACHE,
    text_encoder_2=pipe.text_encoder_2,
    vae=pipe.vae,
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True,
    local_files_only=False,
)

# OPTIMIZATION 4: Use "Detail Math" (DPM++ SDE Karras) for the Refiner
# This adds realistic noise/grain to metal and gems.
refiner.scheduler = DPMSolverSDEScheduler.from_config(
    refiner.scheduler.config,
    use_karras_sigmas=True,
    noise_sampler_seed=0
)

# Apply optimizations to Refiner too
refiner.enable_model_cpu_offload()
try:
    refiner.enable_xformers_memory_efficient_attention()
except Exception:
    pass

# ─── Generation Function ───
def generate(prompt: str):
    # Total steps. 30-40 is the sweet spot for this Hybrid setup.
    n_steps = 100
    
    # The "Handoff" point.
    # Base runs for 80% of steps (Structure). Refiner runs for 20% (Polish).
    high_noise_frac = 0.8
    
    print(f"Generating: '{prompt}'...")
    
    # 1. Run Base (Fast Math)
    base_out = pipe(
        prompt=prompt,
        num_inference_steps=n_steps,
        guidance_scale=7.0, 
        denoising_end=high_noise_frac,
        output_type="latent",
    )
    latents = base_out.images

    # 2. Run Refiner (Detail Math)
    refined = refiner(
        prompt=prompt,
        num_inference_steps=n_steps,
        guidance_scale=7.0,
        denoising_start=high_noise_frac,
        image=latents,
    )
    
    print("Done!")
    return refined.images[0]

# ─── Gradio UI ───
with gr.Blocks() as demo:
    gr.Markdown("# SDXL Hybrid Jewelry Generator (Fast + Realistic)")
    
    with gr.Row():
        with gr.Column():
            inp = gr.Textbox(label="Enter your prompt", placeholder="A gold diamond ring...")
            btn = gr.Button("Generate", variant="primary")
        with gr.Column():
            out = gr.Image(label="Result")
            
    btn.click(generate, inp, out)

if __name__ == "__main__":
    demo.launch()