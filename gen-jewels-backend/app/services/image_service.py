import os
import torch
import uuid
from diffusers import (
    DiffusionPipeline, 
    DPMSolverMultistepScheduler
)

# --- Configuration ---
MODEL_CACHE = r"D:\ramesh\text jewelry\models_cache"
BASE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"
# Refiner is removed
LORA_PATH = r"D:\ramesh\text jewelry\fine tune\jewelry_lora\pytorch_lora_weights.safetensors"
STORAGE_DIR = r"D:\ramesh\genjewels\gen-jewels-backend\storage\generated_image"

class SDXLService:
    def __init__(self):
        self.pipe = None

    def load_models(self):
        """
        Loads models with 'Fast Math' and Memory Optimizations.
        """
        if self.pipe is not None:
            return

        print("⚡ Loading SDXL Base Model (Structure Builder)...")
        self.pipe = DiffusionPipeline.from_pretrained(
            BASE_MODEL,
            cache_dir=MODEL_CACHE,
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True,
            local_files_only=False, # Allow download if missing
        )

        # 1. OPTIMIZATION: Use Fast Math (DPM++ 2M Karras) for the Base
        self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(
            self.pipe.scheduler.config,
            use_karras_sigmas=True,
            algorithm_type="dpmsolver++"
        )

        # 2. Load LoRA
        if os.path.exists(LORA_PATH):
            print(f"✅ Loading LoRA: {os.path.basename(LORA_PATH)}")
            try:
                self.pipe.load_lora_weights(
                    LORA_PATH,
                    adapter_name="jewelry"
                )
            except Exception as e:
                print(f"⚠️ LoRA Load Error: {e}")
        else:
            print(f"⚠️ LoRA not found at {LORA_PATH}")

        # 3. OPTIMIZATION: Smart CPU Offload (Saves VRAM)
        self.pipe.enable_model_cpu_offload()

        # 4. OPTIMIZATION: xFormers (Speed Boost)
        try:
            self.pipe.enable_xformers_memory_efficient_attention()
            print("✅ xFormers enabled.")
        except Exception as e:
            print(f"⚠️ Could not enable xFormers: {e}")

        print("✅ Single-Stage AI Pipeline Ready.")

    def generate(self, prompt: str) -> str:
        """
        Generates an image using ONLY the Base Model (No Refiner).
        """
        if not self.pipe:
            self.load_models()

        # Standard SDXL steps
        n_steps = 40 

        print(f"🎨 Generating: {prompt[:50]}...")

        # --- CRITICAL FIXES HERE ---
        # 1. output_type="pil" (Gives a real image, not latents)
        # 2. denoising_end=None (Does the full 100% generation)
        image = self.pipe(
            prompt=prompt,
            num_inference_steps=n_steps,
            guidance_scale=7.0,
            denoising_end=None, # Full generation
            output_type="pil",  # Real Image
        ).images[0]

        # 3. Save Image
        os.makedirs(STORAGE_DIR, exist_ok=True)
        filename = f"{uuid.uuid4()}.png"
        save_path = os.path.join(STORAGE_DIR, filename)
        image.save(save_path)
        
        print(f"✅ Image saved: {filename}")
        
        # Return path relative to project root
        return f"storage/generated_image/{filename}"

# Singleton Instance
sd_service = SDXLService()