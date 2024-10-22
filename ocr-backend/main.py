from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError
import pytesseract
import simpleaudio as sa
import os

app = FastAPI()

# Set the path to the Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Define the directory where the digit audio files (0-9) are located
AUDIO_FILES_DIR = os.path.dirname(__file__)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI OCR Service!"}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        # Load the image from the uploaded file
        try:
            image = Image.open(file.file)
        except UnidentifiedImageError:
            raise HTTPException(status_code=400, detail="Invalid image format.")

        # Use PyTesseract to extract digits from the image
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789'
        result = pytesseract.image_to_string(image, config=custom_config, lang='ara_number')

        # Extract and clean the recognized digits
        recognized_digits = result.strip()

        # Print the recognized digits to the terminal
        print("Recognized Digits:", recognized_digits)

        if not recognized_digits:
            return JSONResponse(content={"message": "No digits recognized."})

        # Play the corresponding audio for each digit
        for digit in recognized_digits:
            if digit.isdigit():
                audio_file_path = os.path.join(AUDIO_FILES_DIR, f"{digit}.wav")
                if os.path.exists(audio_file_path):
                    try:
                        wave_obj = sa.WaveObject.from_wave_file(audio_file_path)
                        play_obj = wave_obj.play()
                        play_obj.wait_done()
                    except Exception as audio_err:
                        print(f"Error playing audio for digit '{digit}': {audio_err}")
                else:
                    print(f"Audio file for digit '{digit}' not found.")

        # Return the result as JSON
        return JSONResponse(content={"result": recognized_digits})
    except Exception as e:
        print("Error:", str(e))
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
