import os
import io
import tempfile
import torch
import yaml
import soundfile as sf
import time
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from modules.commons import str2bool

if torch.cuda.is_available():
    device = torch.device("cuda")
elif torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")

dtype = torch.float16

vc_wrapper_v2 = None

app = FastAPI(
    title="Seed-VC Voice Conversion API",
    description="Real-time voice conversion using Seed-VC V2 model",
    version="1.0.0"
)


class ConversionParams(BaseModel):
    """Request parameters for voice conversion"""
    diffusion_steps: int = 30
    length_adjust: float = 1.0
    intelligibility_cfg_rate: float = 0.7
    similarity_cfg_rate: float = 0.7
    top_p: float = 0.9
    temperature: float = 1.0
    repetition_penalty: float = 1.0
    convert_style: bool = False
    anonymization_only: bool = False
    compile: bool = False


class ConversionRequest:
    """Container for conversion request parameters"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)


def load_v2_models(args):
    """Load V2 models using the wrapper"""
    from hydra.utils import instantiate
    from omegaconf import DictConfig
    
    cfg = DictConfig(yaml.safe_load(open("configs/v2/vc_wrapper.yaml", "r")))
    vc_wrapper = instantiate(cfg)
    vc_wrapper.load_checkpoints(
        ar_checkpoint_path=getattr(args, 'ar_checkpoint_path', None),
        cfm_checkpoint_path=getattr(args, 'cfm_checkpoint_path', None)
    )
    vc_wrapper.to(device)
    vc_wrapper.eval()

    vc_wrapper.setup_ar_caches(max_batch_size=1, max_seq_len=4096, dtype=dtype, device=device)

    if args.compile:
        torch._inductor.config.coordinate_descent_tuning = True
        torch._inductor.config.triton.unique_kernel_names = True

        if hasattr(torch._inductor.config, "fx_graph_cache"):
            torch._inductor.config.fx_graph_cache = True
        vc_wrapper.compile_ar()

    return vc_wrapper


def convert_voice_v2(source_audio_path: str, target_audio_path: str, args) -> tuple:
    """
    Convert voice using V2 model
    
    Returns:
        Tuple of (sample_rate, audio_array)
    """
    global vc_wrapper_v2
    if vc_wrapper_v2 is None:
        vc_wrapper_v2 = load_v2_models(args)

    generator = vc_wrapper_v2.convert_voice_with_streaming(
        source_audio_path=source_audio_path,
        target_audio_path=target_audio_path,
        diffusion_steps=args.diffusion_steps,
        length_adjust=args.length_adjust,
        intelligibility_cfg_rate=args.intelligibility_cfg_rate,
        similarity_cfg_rate=args.similarity_cfg_rate,
        top_p=args.top_p,
        temperature=args.temperature,
        repetition_penalty=args.repetition_penalty,
        convert_style=args.convert_style,
        anonymization_only=args.anonymization_only,
        device=device,
        dtype=dtype,
        stream_output=True
    )

    full_audio = None
    for output in generator:
        _, full_audio = output
    
    return full_audio


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "device": str(device),
        "model_loaded": vc_wrapper_v2 is not None
    }


@app.post("/convert")
async def convert_voice(
    source_audio: UploadFile = File(..., description="Source audio file to convert"),
    target_voice: str = Form(..., description="Absolute path to target/reference voice audio"),
    diffusion_steps: int = Form(30),
    length_adjust: float = Form(1.0),
    intelligibility_cfg_rate: float = Form(0.7),
    similarity_cfg_rate: float = Form(0.7),
    top_p: float = Form(0.9),
    temperature: float = Form(1.0),
    repetition_penalty: float = Form(1.0),
    convert_style: bool = Form(False),
    anonymization_only: bool = Form(False),
    compile: bool = Form(False),
):
    """
    Convert voice from source audio to target voice style
    
    Args:
        source_audio: Source audio file (WAV, MP3, etc.)
        target_voice: Absolute path to target/reference voice audio file
        diffusion_steps: Number of diffusion steps (default: 30)
        length_adjust: Length adjustment factor (default: 1.0)
        intelligibility_cfg_rate: CFG rate for intelligibility (default: 0.7)
        similarity_cfg_rate: CFG rate for similarity (default: 0.7)
        top_p: Top-p sampling parameter (default: 0.9)
        temperature: Temperature for sampling (default: 1.0)
        repetition_penalty: Repetition penalty (default: 1.0)
        convert_style: Convert style/emotion/accent (default: False)
        anonymization_only: Anonymization only mode (default: False)
        compile: Compile model for faster inference (default: False)
    
    Returns:
        Audio binary (WAV format)
    """
    
    if not os.path.exists(target_voice):
        raise HTTPException(
            status_code=400,
            detail=f"Target voice file not found: {target_voice}"
        )
    
    temp_dir = tempfile.mkdtemp()
    source_temp_path = None
    
    try:
        
        source_temp_path = os.path.join(temp_dir, "source_audio.wav")
        contents = await source_audio.read()
        with open(source_temp_path, "wb") as f:
            f.write(contents)
        
        conversion_args = ConversionRequest(
            source=source_temp_path,
            target=target_voice,
            diffusion_steps=diffusion_steps,
            length_adjust=length_adjust,
            intelligibility_cfg_rate=intelligibility_cfg_rate,
            similarity_cfg_rate=similarity_cfg_rate,
            top_p=top_p,
            temperature=temperature,
            repetition_penalty=repetition_penalty,
            convert_style=convert_style,
            anonymization_only=anonymization_only,
            compile=compile,
            ar_checkpoint_path=None,
            cfm_checkpoint_path=None,
        )
        
        start_time = time.time()
        converted_audio = convert_voice_v2(source_temp_path, target_voice, conversion_args)
        end_time = time.time()
        
        if converted_audio is None:
            raise HTTPException(
                status_code=500,
                detail="Voice conversion failed: returned None"
            )
        
        save_sr, audio_data = converted_audio
        
        audio_bytes = io.BytesIO()
        sf.write(audio_bytes, audio_data, save_sr, format='WAV')
        audio_bytes.seek(0)
        
        return StreamingResponse(content=audio_bytes, media_type="audio/wav")
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Voice conversion error: {str(e)}"
        )
    
    finally:
        if source_temp_path and os.path.exists(source_temp_path):
            os.remove(source_temp_path)
        if os.path.exists(temp_dir):
            os.rmdir(temp_dir)


@app.post("/batch-convert")
async def batch_convert(
    source_audio: UploadFile = File(...),
    target_voices: str = Form(..., description="Comma-separated absolute paths to target voice files"),
    diffusion_steps: int = Form(30),
    length_adjust: float = Form(1.0),
    intelligibility_cfg_rate: float = Form(0.7),
    similarity_cfg_rate: float = Form(0.7),
    top_p: float = Form(0.9),
    temperature: float = Form(1.0),
    repetition_penalty: float = Form(1.0),
):
    """
    Convert voice to multiple target voices in one request
    
    Args:
        source_audio: Source audio file
        target_voices: Comma-separated absolute paths to target voice files
        ... (other parameters same as /convert)
    
    Returns:
        JSON with results for each target voice
    """
    
    target_paths = [p.strip() for p in target_voices.split(",")]
    
 
    for target_path in target_paths:
        if not os.path.exists(target_path):
            raise HTTPException(
                status_code=400,
                detail=f"Target voice file not found: {target_path}"
            )
    
    results = {}
    temp_dir = tempfile.mkdtemp()
    source_temp_path = None
    
    try:
        source_temp_path = os.path.join(temp_dir, "source_audio.wav")
        contents = await source_audio.read()
        with open(source_temp_path, "wb") as f:
            f.write(contents)
        
        for target_path in target_paths:
            try:
                conversion_args = ConversionRequest(
                    source=source_temp_path,
                    target=target_path,
                    diffusion_steps=diffusion_steps,
                    length_adjust=length_adjust,
                    intelligibility_cfg_rate=intelligibility_cfg_rate,
                    similarity_cfg_rate=similarity_cfg_rate,
                    top_p=top_p,
                    temperature=temperature,
                    repetition_penalty=repetition_penalty,
                    convert_style=False,
                    anonymization_only=False,
                    compile=False,
                    ar_checkpoint_path=None,
                    cfm_checkpoint_path=None,
                )
                
                start_time = time.time()
                converted_audio = convert_voice_v2(source_temp_path, target_path, conversion_args)
                end_time = time.time()
                
                if converted_audio is not None:
                    save_sr, audio_data = converted_audio
                    audio_bytes = io.BytesIO()
                    sf.write(audio_bytes, audio_data, save_sr, format='WAV')
                    results[target_path] = {
                        "status": "success",
                        "processing_time": f"{end_time - start_time:.2f}s",
                        "sample_rate": save_sr,
                        "audio_duration": len(audio_data) / save_sr
                    }
                else:
                    results[target_path] = {
                        "status": "failed",
                        "error": "Conversion returned None"
                    }
            
            except Exception as e:
                results[target_path] = {
                    "status": "failed",
                    "error": str(e)
                }
        
        return {"results": results}
    
    finally:
        if source_temp_path and os.path.exists(source_temp_path):
            os.remove(source_temp_path)
        if os.path.exists(temp_dir):
            os.rmdir(temp_dir)


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000,
        log_level="info"
    )
