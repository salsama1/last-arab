import React, { useState, useRef } from 'react';
import './index.css';

function App() {
  const [result, setResult] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start the camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use the back camera
      });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  // Capture the photo from the video feed
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Draw the current frame from the video onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to a blob
    canvas.toBlob((blob) => {
      if (blob) {
        sendImage(blob);
      }
    }, 'image/jpeg');
  };

  // Send the captured image to the back end
  const sendImage = async (imageBlob) => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'capture.jpg');

    try {
      const response = await fetch('https://arabic-digit-ocr-backend.onrender.com/upload', {
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

      {/* Video element for camera preview */}
      <video
        ref={videoRef}
        autoPlay
        className="mb-4 w-96 h-72 border rounded"
      />

      {/* Hidden canvas to capture images */}
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        className="hidden"
      />

      {/* Start Camera Button */}
      <button
        onClick={startCamera}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Start Camera
      </button>

      {/* Capture Button */}
      <button
        onClick={capturePhoto}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Capture & Scan
      </button>

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
