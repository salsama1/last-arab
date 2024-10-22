from flask import jsonify, make_response
from PIL import Image, UnidentifiedImageError
import pytesseract
import simpleaudio as sa
import os
from io import BytesIO

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
AUDIO_FILES_DIR = os.path.dirname(__file__)

def handle_root():
    return jsonify({"message": "Welcome to the Flask OCR Service!"})

def handle_upload(file):
    try:
        try:
            image = Image.open(file)
        except UnidentifiedImageError:
            return make_response({"error": "Invalid image format."}, 400)

        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789'
        result = pytesseract.image_to_string(image, config=custom_config, lang='ara_number')

        recognized_digits = result.strip()
        print("noo")
        if not recognized_digits:
            return jsonify({"message": "No digits recognized."})

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

        return jsonify({"result": recognized_digits})
    except Exception as e:
        print(f"Error: {str(e)}")
        return make_response({"error": str(e)}, 500)
