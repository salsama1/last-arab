from flask import Blueprint, request
from controller import handle_root, handle_upload

main = Blueprint('main', __name__)

@main.route('/', methods=['GET'])
def root():
    return handle_root()

@main.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    if file is None:
        return {"error": "No file uploaded"}, 400
    return handle_upload(file)
