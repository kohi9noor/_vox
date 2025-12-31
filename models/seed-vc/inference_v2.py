import torch
import yaml
import soundfile as sf
import uuid
from pathlib import Path
from hydra.utils import instantiate
from omegaconf import DictConfig
import json
import sys

if torch.cuda.is_available():
    device = torch.device("cuda")
elif torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")

dtype = torch.float16


MODEL_DIR = Path(__file__).parent.absolute()

DATA_DIR = MODEL_DIR.parent.parent / "data" / "output"

vc_wrapper_v2 = None


def load_v2_models(ar_checkpoint_path=None, cfm_checkpoint_path=None, compile=False):
    """Load V2 models using the wrapper with proper checkpoint loading"""
    cfg = DictConfig(yaml.safe_load(open(str(MODEL_DIR / "configs/v2/vc_wrapper.yaml"), "r")))

    vc_wrapper = instantiate(cfg)
    
    vc_wrapper.load_checkpoints(
        ar_checkpoint_path=ar_checkpoint_path,
        cfm_checkpoint_path=cfm_checkpoint_path
    )
    
    vc_wrapper.to(device)
    
    vc_wrapper.eval()
    
    vc_wrapper.setup_ar_caches(max_batch_size=1, max_seq_len=4096, dtype=dtype, device=device)
    
    if compile:
        torch._inductor.config.coordinate_descent_tuning = True
        torch._inductor.config.triton.unique_kernel_names = True
        if hasattr(torch._inductor.config, "fx_graph_cache"):
            torch._inductor.config.fx_graph_cache = True
        vc_wrapper.compile_ar()
    
    return vc_wrapper


def convert_voice(
    source_audio_path: str,
    target_audio_path: str,
    diffusion_steps: int = 30,
    length_adjust: float = 1.0,
    top_p: float = 0.9,
    temperature: float = 1.0,
    repetition_penalty: float = 1.0,
    convert_style: bool = False,
    anonymization_only: bool = False,
    ar_checkpoint_path: str = None,
    cfm_checkpoint_path: str = None,
    compile: bool = False,
    output_path: str = None
) -> str:
    """
    Convert voice using Seed-VC V2 model and save to disk
    """
    try:
        global vc_wrapper_v2
        
        source_path = Path(source_audio_path).absolute()
        target_path = Path(target_audio_path).absolute()
        
        if not source_path.exists():
            raise FileNotFoundError(f"Source audio file not found: {source_audio_path}")
        if not target_path.exists():
            raise FileNotFoundError(f"Target audio file not found: {target_audio_path}")
        
        if vc_wrapper_v2 is None:
            vc_wrapper_v2 = load_v2_models(
                ar_checkpoint_path=ar_checkpoint_path,
                cfm_checkpoint_path=cfm_checkpoint_path,
                compile=compile
            )

        DATA_DIR.mkdir(parents=True, exist_ok=True)
        
        generator = vc_wrapper_v2.convert_voice_with_streaming(
            source_audio_path=str(source_path),
            target_audio_path=str(target_path),
            diffusion_steps=diffusion_steps,
            length_adjust=length_adjust,
            top_p=top_p,
            temperature=temperature,
            repetition_penalty=repetition_penalty,
            convert_style=convert_style,
            anonymization_only=anonymization_only,
            device=device,
            dtype=dtype,
            stream_output=True
        )
        
        full_audio = None
        for output in generator:
            _, full_audio = output
        
        if full_audio is None:
            raise Exception("Voice conversion returned None")
        
        save_sr, audio_data = full_audio
        
        if output_path:
            audio_file_path = Path(output_path)
        else:
            audio_uuid = str(uuid.uuid4())
            audio_file_path = DATA_DIR / f"{audio_uuid}.wav"
            
        sf.write(str(audio_file_path), audio_data, save_sr, format='WAV')
        
        return str(audio_file_path)
    except Exception as e:
        raise Exception(f"Voice conversion error: {str(e)}")

if __name__ == "__main__":
    # Redirect stdout to stderr to avoid polluting the output with library logs
    real_stdout = sys.stdout
    sys.stdout = sys.stderr

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            payload = json.loads(line)
            
            source_path = payload.get('source_path') or payload.get('audioPath')
            target_path = payload.get('targetedVoicePath')
            output_path = payload.get('output_path')

            result_path = convert_voice(
                source_audio_path=source_path,
                target_audio_path=target_path,
                output_path=output_path
            )
            print(result_path, file=real_stdout, flush=True)
        except Exception as e:
            print(f"__ERROR__:{str(e)}", file=real_stdout, flush=True)
