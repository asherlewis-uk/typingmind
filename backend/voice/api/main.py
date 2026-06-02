import os, tempfile
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from faster_whisper import WhisperModel

BASE_DIR = "/app"

app = FastAPI()
whisper = WhisperModel("large-v3", device="cpu", compute_type="int8",
                       download_root=f"{BASE_DIR}/models/whisper")

from piper import PiperVoice
import wave

voice = PiperVoice.load(f"{BASE_DIR}/models/piper/en_US-lessac-medium.onnx")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
        tmp.write(await audio.read()); tmp.flush()
        segments, _ = whisper.transcribe(tmp.name, beam_size=5)
        text = " ".join([s.text for s in segments])
        os.unlink(tmp.name)
    return JSONResponse({"text": text.strip()})

@app.post("/speak")
async def speak(text: str = Form(...)):
    out = tempfile.mktemp(suffix=".wav")
    chunks = voice.synthesize(text)
    with wave.open(out, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(voice.config.sample_rate)
        for chunk in chunks:
            wf.writeframes(chunk.audio_int16_bytes)
    return FileResponse(out, media_type="audio/wav", filename="response.wav")
