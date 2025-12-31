import os
import subprocess
import sys
import json
from pathlib import Path

MODELS_DIR = Path(__file__).parent.absolute()
CONFIG_FILE = MODELS_DIR / "model.config.json"

def run_command(command, cwd=None, env=None):
    print(f"Running: {' '.join(command)} in {cwd or os.getcwd()}")
    process = subprocess.Popen(
        command,
        cwd=cwd,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )
    for line in process.stdout:
        print(line, end="")
    process.wait()
    if process.returncode != 0:
        print(f"Command failed with return code {process.returncode}")
        return False
    return True

def setup_venv(model_path):
    venv_path = model_path / ".venv"
    if not venv_path.exists():
        print(f"Creating virtual environment in {venv_path}...")
        if not run_command([sys.executable, "-m", "venv", str(venv_path)]):
            return None
    
    if os.name == "nt":
        python_exe = venv_path / "Scripts" / "python.exe"
        pip_exe = venv_path / "Scripts" / "pip.exe"
    else:
        python_exe = venv_path / "bin" / "python"
        pip_exe = venv_path / "bin" / "pip"
    
    return python_exe, pip_exe

def install_requirements(pip_exe, requirements_file):
    if requirements_file.exists():
        print(f"Installing requirements from {requirements_file}...")
        
        with open(requirements_file, "r") as f:
            lines = f.readlines()
        
        filtered_lines = []
        for line in lines:
            if sys.platform == "darwin":
                if "--extra-index-url" in line and "download.pytorch.org/whl/cu" in line:
                    continue
            filtered_lines.append(line)
        
        temp_req = requirements_file.parent / "temp_requirements.txt"
        with open(temp_req, "w") as f:
            f.writelines(filtered_lines)
        
        run_command([str(pip_exe), "install", "-r", str(temp_req)])
        temp_req.unlink()
    else:
        print(f"No requirements file found at {requirements_file}")

def check_versions(python_exe, packages):
    print(f"\n--- Verifying versions for {python_exe.parent.parent.name} ---")
    for pkg in packages:
        import_name = pkg
        if pkg == "coqui-tts": import_name = "TTS"
        if pkg == "pytorch-lightning": import_name = "pytorch_lightning"
        
        cmd = [str(python_exe), "-c", f"try:\n    import {import_name}\n    print(f'{pkg}: {{getattr({import_name}, \"__version__\", \"unknown\")}}')\nexcept ImportError:\n    print(f'{pkg}: Not installed')"]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                print(result.stdout.strip())
            else:
                print(f"{pkg}: Error checking version")
        except Exception:
            print(f"{pkg}: Error")

def download_model(model_name, download_url, target_dir):
    print(f"\n--- Downloading models for {model_name} ---")
    print(f"Source: {download_url}")
    print(f"Target: {target_dir}")
    
    target_dir.mkdir(parents=True, exist_ok=True)
    
    if "drive.google.com" in download_url:
        try:
            import gdown
        except ImportError:
            print("Installing 'gdown' to handle Google Drive downloads...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "gdown"])
            import gdown
        
        print(f"Downloading folder from Google Drive...")
        if "/drive/folders/" in download_url:
            folder_id = download_url.split("/folders/")[1].split("?")[0]
            try:
                gdown.download_folder(id=folder_id, output=str(target_dir), quiet=False, use_cookies=False)
            except Exception as e:
                print(f"Failed to download folder: {e}")
                print(f"Please manually download from: {download_url}")
        else:
            try:
                gdown.download(download_url, str(target_dir), quiet=False, fuzzy=True)
            except Exception as e:
                print(f"Failed to download: {e}")
                print(f"Please manually download from: {download_url}")
    else:
        print(f"Automatic download not supported for this URL. Please manually download to {target_dir}")

def main():
    if not CONFIG_FILE.exists():
        print(f"Config file not found: {CONFIG_FILE}")
        return

    with open(CONFIG_FILE, "r") as f:
        config = json.load(f)

    seed_vc_path = MODELS_DIR / "seed-vc"
    if seed_vc_path.exists():
        print("\n--- Setting up Seed-VC ---")
        python_exe, pip_exe = setup_venv(seed_vc_path)
        if python_exe:
            req_file = seed_vc_path / "requirements-mac.txt" if sys.platform == "darwin" else seed_vc_path / "requirements.txt"
            install_requirements(pip_exe, req_file)
            check_versions(python_exe, ["torch", "transformers", "gradio", "fastapi", "numpy"])

    maa_path = MODELS_DIR / "make-an-audio"
    if maa_path.exists():
        print("\n--- Setting up Make-An-Audio ---")
        python_exe, pip_exe = setup_venv(maa_path)
        if python_exe:
            install_requirements(pip_exe, maa_path / "requirements.txt")
            check_versions(python_exe, ["torch", "pytorch-lightning", "numpy", "librosa"])
            if "make-an-audio" in config:
                download_url = config["make-an-audio"]["model"]["download"]
                download_model("make-an-audio", download_url, maa_path)

    xtts_path = MODELS_DIR / "xtts-v2"
    if xtts_path.exists():
        print("\n--- Setting up XTTS-v2 ---")
        python_exe, pip_exe = setup_venv(xtts_path)
        if python_exe:
            print("Installing TTS package and torchcodec for XTTS-v2...")
            run_command([str(pip_exe), "install", "coqui-tts", "torchcodec"])
            check_versions(python_exe, ["torch", "coqui-tts", "torchcodec"])
            if "xtts" in config:
                download_url = config["xtts"]["model"]["download"]
                download_model("xtts", download_url, xtts_path)

if __name__ == "__main__":
    main()
