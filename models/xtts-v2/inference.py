from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
import torch
from pathlib import Path
import soundfile as sf
import uuid
import logging
import json
import sys

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.absolute()
DATA_DIR = MODEL_DIR.parent.parent / "data" / "output"

config = None
model = None
device = None

def init_model():
    """Initialize the model once and keep it in memory"""
    global config, model, device
    
    if model is not None:
        return  
    
    logger.info("Initializing XTTS model (loading to memory)...")
    config = XttsConfig()
    config.load_json(str(MODEL_DIR / "config.json"))
    config.tokenizer_file = str(MODEL_DIR / "vocab.json")
    
    model = Xtts.init_from_config(config)
    model.load_checkpoint(config, checkpoint_dir=str(MODEL_DIR), eval=True)
    
    if torch.cuda.is_available():
        device = torch.device("cuda")
    elif torch.backends.mps.is_available():
        device = torch.device("mps")
    else:
        device = torch.device("cpu")
    
    model.to(device)
    logger.info(f"Model loaded on device: {device}")

init_model()

def synthesize(text: str, targetedVoicePath: str, language: str = "en", gptCondLen: int = 10, output_path: str = None) -> str:
    """
    Synthesize speech from text using a reference speaker and save to disk
    
    Args:
        text: Text to synthesize
        targetedVoicePath: Path to reference speaker WAV file
        language: Language code (default: "en")
        gptCondLen: GPT conditioning length (default: 10)
        output_path: Optional specific path to save the output
    
    Returns:
        Path to the saved audio file
    """
    if model is None:
        raise RuntimeError("Model not initialized. Call init_model() first.")
    
    try:
        speaker_path = Path(targetedVoicePath).absolute()
        
        if not speaker_path.exists():
            raise FileNotFoundError(f"Speaker wav file not found: {targetedVoicePath}")
        
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Synthesizing: text='{text[:50]}...' speaker={speaker_path.name}")
        
        outputs = model.synthesize(
            text,
            config,
            speaker_wav=str(speaker_path),
            gpt_cond_len=gptCondLen,
            language=language,
            enable_text_splitting=True
        )
        
        audio_data = outputs["wav"]
        
        if output_path:
            audio_file_path = Path(output_path)
        else:
            audio_uuid = str(uuid.uuid4())
            audio_file_path = DATA_DIR / f"{audio_uuid}.wav"
        
        sf.write(str(audio_file_path), audio_data, config.audio.sample_rate, format='WAV')
        
        logger.info(f"Synthesis complete: {audio_file_path}")
        return str(audio_file_path)
    
    except Exception as e:
        logger.error(f"Synthesis error: {str(e)}")
        raise Exception(f"Synthesis error: {str(e)}")


import json
import sys

if __name__ == "__main__":
    # Redirect stdout to stderr to avoid polluting the output with library logs
    real_stdout = sys.stdout
    sys.stdout = sys.stderr

    logger.info("XTTS inference worker started (warm mode)")

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            payload = json.loads(line)

            result_path = synthesize(
                text=payload["text"],
                targetedVoicePath=payload["targetedVoicePath"],
                language=payload.get("language", "en"),
                output_path=payload.get("output_path"),
            )

            print(result_path, file=real_stdout, flush=True)

        except Exception as e:
            err_msg = f"__ERROR__:{str(e)}"
            logger.error(err_msg)
            print(err_msg, file=real_stdout, flush=True)
