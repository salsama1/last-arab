import React, { useState, useRef } from 'react';
import './index.css';

function App() {
  const [result, setResult] = useState('');
  const [uploadMode, setUploadMode] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, 
      });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        sendImage(blob);
      }
    }, 'image/jpeg');
  };


  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      sendImage(file);
    }
  };

  const sendImage = async (imageBlob) => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'upload.jpg');

    try {
      const response = await fetch('https://last-arab.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Arabic Digit OCR</h1>

      {}
      <div className="mb-4">
        <button
          onClick={() => setUploadMode(false)}
          className={`px-4 py-2 rounded mr-2 ${!uploadMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Use Camera
        </button>
        <button
          onClick={() => setUploadMode(true)}
          className={`px-4 py-2 rounded ${uploadMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Upload Image
        </button>
      </div>

      {}
      {!uploadMode ? (
        <>
          {}
          <video
            ref={videoRef}
            autoPlay
            className="mb-4 w-96 h-72 border rounded"
          />

          {}
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            className="hidden"
          />

          {}
          <button
            onClick={startCamera}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4"
          >
            Start Camera
          </button>

          {}
          <button
            onClick={capturePhoto}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Capture & Scan
          </button>
        </>
      ) : (
        <>
          {}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="mb-4"
          />
        </>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h2 className="text-xl font-semibold">Detected Digits:</h2>
          <p className="mt-2">{result}</p>
        </div>
      )}
    </div>
  );
}

export default App;
