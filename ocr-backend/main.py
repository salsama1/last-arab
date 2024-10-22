from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
import pytesseract

app = FastAPI()

# Set the path to the Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        # Load the image from the uploaded file
        image = Image.open(file.file)

        # Use PyTesseract to extract digits from the image
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789'
        result = pytesseract.image_to_string(image, config=custom_config, lang='ara_number')

        # Print the result to the terminal
        print("Recognized Digits:", result.strip())

        # Return the result as JSON
        return JSONResponse(content={"result": result.strip()})
    except Exception as e:
        print("Error:", str(e))  # Print error if any occurs
        return JSONResponse(content={"error": str(e)}, status_code=500)
