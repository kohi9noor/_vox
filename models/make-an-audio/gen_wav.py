from pathlib import Path
import torch
import numpy as np
from vocoder.bigvgan.models import VocoderBigVGAN
from ldm.models.diffusion.ddim import DDIMSampler
from ldm.util import instantiate_from_config
from omegaconf import OmegaConf
import argparse
import soundfile
import uuid
import json
import sys
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

device = torch.device('cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu')

SAMPLE_RATE = 16000

DATA_DIR = Path(__file__).parent.parent.parent / "data" / "output"
MODEL_DIR = Path(__file__).parent.absolute()

def parse_args():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--prompt",
        type=str,
        default="a bird chirps",
        help="the prompt to generate audio"
    )

    parser.add_argument(
        "--ddim_steps",
        type=int,
        default=100,
        help="number of ddim sampling steps",
    )

    parser.add_argument(
        "--duration",
        type=int,
        default=10,
        help="audio duration, seconds",
    )

    parser.add_argument(
        "--n_samples",
        type=int,
        default=1,
        help="how many samples to produce for the given prompt",
    )

    parser.add_argument(
        "--scale",
        type=float,
        default=3.0, # if it's 1, only condition is taken into consideration
        help="unconditional guidance scale: eps = eps(x, empty) + scale * (eps(x, cond) - eps(x, empty))",
    ) 

 
    return parser.parse_args()

def initialize_model(config, ckpt,device=device):
    config = OmegaConf.load(config)
    model = instantiate_from_config(config.model)
    model.load_state_dict(torch.load(ckpt,map_location='cpu', weights_only=False)["state_dict"], strict=False)

    model = model.to(device)
    model.cond_stage_model.to(model.device)
    model.cond_stage_model.device = model.device
    logger.info(f"Model device: {model.device}, Target device: {device}")
    sampler = DDIMSampler(model)

    return sampler

def dur_to_size(duration):
    latent_width = int(duration * 7.8)
    if latent_width % 4 != 0:
        latent_width = (latent_width // 4 + 1) * 4
    return latent_width

def gen_wav(sampler,vocoder,prompt,ddim_steps,scale,duration,n_samples):
    latent_width = dur_to_size(duration)
    start_code = torch.randn(n_samples, sampler.model.first_stage_model.embed_dim, 10, latent_width).to(device=device, dtype=torch.float32)
    
    uc = None
    if scale != 1.0:
        uc = sampler.model.get_learned_conditioning(n_samples * [""])
    c = sampler.model.get_learned_conditioning(n_samples * [prompt])
    shape = [sampler.model.first_stage_model.embed_dim, 10, latent_width]  # 10 is latent height 
    samples_ddim, _ = sampler.sample(S=ddim_steps,
                                        conditioning=c,
                                        batch_size=n_samples,
                                        shape=shape,
                                        verbose=False,
                                        unconditional_guidance_scale=scale,
                                        unconditional_conditioning=uc,
                                        x_T=start_code)

    x_samples_ddim = sampler.model.decode_first_stage(samples_ddim)

    wav_list = []
    for idx,spec in enumerate(x_samples_ddim):
        wav = vocoder.vocode(spec)
        if len(wav) < SAMPLE_RATE * duration:
            wav = np.pad(wav,SAMPLE_RATE*duration-len(wav),mode='constant',constant_values=0)
        wav_list.append(wav)
    return wav_list

if __name__ == '__main__':
    # Redirect stdout to stderr to avoid polluting the output with library logs
    real_stdout = sys.stdout
    sys.stdout = sys.stderr

    logger.info("Make-An-Audio worker started")
    
    # Initialize models once
    sampler = initialize_model(
        str(MODEL_DIR / 'configs/text_to_audio/txt2audio_args.yaml'), 
        str(MODEL_DIR / 'useful_ckpts/maa1_full.ckpt')
    )
    vocoder = VocoderBigVGAN(str(MODEL_DIR / 'useful_ckpts/bigvgan'), device=device)

    # Check if we are running interactively or being piped
    if sys.stdin.isatty():
        logger.info("Running in interactive mode (using argparse)")
        args = parse_args()
        prompt = args.prompt
        duration = args.duration
        ddim_steps = args.ddim_steps
        scale = args.scale
        n_samples = args.n_samples
        
        wav_list = gen_wav(sampler, vocoder, prompt, ddim_steps, scale, duration, n_samples)
        last_id = ""
        for idx, wav in enumerate(wav_list):
            id = uuid.uuid4()
            output_path = DATA_DIR / f"{id}.wav"
            soundfile.write(str(output_path), wav, samplerate=SAMPLE_RATE)
            last_id = str(id)
        print(last_id, file=real_stdout, flush=True)
    else:
        logger.info("Running in pipe mode (waiting for JSON on stdin)")
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue

            try:
                payload = json.loads(line)
                prompt = payload.get("prompt", "a bird chirps")
                
                duration_val = payload.get("duration")
                duration = int(duration_val) if duration_val is not None else 10
                
                ddim_steps_val = payload.get("ddim_steps")
                ddim_steps = int(ddim_steps_val) if ddim_steps_val is not None else 100
                
                scale_val = payload.get("scale")
                scale = float(scale_val) if scale_val is not None else 3.0
                
                n_samples_val = payload.get("n_samples")
                n_samples = int(n_samples_val) if n_samples_val is not None else 1
                
                output_path_req = payload.get("output_path")

                logger.info(f"Generating audio for prompt: {prompt} ({duration}s)")
                wav_list = gen_wav(
                    sampler, 
                    vocoder, 
                    prompt=prompt, 
                    ddim_steps=ddim_steps, 
                    scale=scale, 
                    duration=duration, 
                    n_samples=n_samples
                )
                
                result_val = ""
                for idx, wav in enumerate(wav_list):
                    if output_path_req:
                        output_path = Path(output_path_req)
                    else:
                        id = uuid.uuid4()
                        output_path = DATA_DIR / f"{id}.wav"
                    
                    soundfile.write(str(output_path), wav, samplerate=SAMPLE_RATE)
                    result_val = str(output_path)
                
                print(result_val, file=real_stdout, flush=True)

            except Exception as e:
                err_msg = f"__ERROR__:{str(e)}"
                logger.error(err_msg)
                print(err_msg, file=real_stdout, flush=True)
