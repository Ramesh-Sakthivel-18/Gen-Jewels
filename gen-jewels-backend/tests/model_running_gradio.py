import os, warnings
import torch
import gradio as gr
from diffusers import DiffusionPipeline

# ─── Silence benign warnings ───
warnings.filterwarnings("ignore", r"No LoRA keys associated to CLIPTextModel.*")
warnings.filterwarnings("ignore", r"No LoRA keys associated to CLIPTextModelWithProjection.*")

# ─── Where to store all HF downloads ───
MODEL_CACHE = r"D:\ramesh\text jewelry\models_cache"
os.makedirs(MODEL_CACHE, exist_ok=True)

# ─── Model repo IDs on Hugging Face ───
BASE_MODEL    = "stabilityai/stable-diffusion-xl-base-1.0"
REFINER_MODEL = "stabilityai/stable-diffusion-xl-refiner-1.0"
LORA_PATH     = r"D:\ramesh\text jewelry\fine tune\jewelry_lora\pytorch_lora_weights.safetensors"

# ─── Sanity check ───
if not os.path.isfile(LORA_PATH):
    raise FileNotFoundError(f"LoRA weights not found at {LORA_PATH}")

# ─── 1) Load & patch base pipeline ───
pipe = DiffusionPipeline.from_pretrained(
    BASE_MODEL,
    cache_dir=MODEL_CACHE,
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True,
    local_files_only=False,       # allow download
).to("cuda")

# apply your LoRA weights
pipe.load_lora_weights(
    {os.path.basename(LORA_PATH): LORA_PATH},
    adapter_type="lora",          # ensure correct adapter type
    local_files_only=True
)

# ─── 2) Load vanilla refiner ───
refiner = DiffusionPipeline.from_pretrained(
    REFINER_MODEL,
    cache_dir=MODEL_CACHE,
    text_encoder_2=pipe.text_encoder_2,
    vae=pipe.vae,
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True,
    local_files_only=False,
).to("cuda")

# ─── Generation function ───
def generate(prompt: str):
    base_out = pipe(
        prompt=prompt,
        num_inference_steps=75,
        guidance_scale=8.0,
        denoising_end=0.7,
        output_type="latent",
    )
    latents = base_out.images
    refined = refiner(
        prompt=prompt,
        num_inference_steps=75,
        guidance_scale=7.5,
        denoising_start=0.7,
        image=latents,
    )
    return refined.images[0]

# ─── Gradio UI ───
with gr.Blocks() as demo:
    gr.Markdown("# SDXL + LoRA Jewelry Generator")
    inp = gr.Textbox(label="Enter your prompt")
    btn = gr.Button("Generate")
    out = gr.Image()
    btn.click(generate, inp, out)

if __name__ == "__main__":
    demo.launch()
