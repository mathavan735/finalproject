import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const CameraSelector = ({ onSelect }) => {
  const [showOptions, setShowOptions] = useState(true);
  const [isMobile] = useState(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

  const handleCameraSelect = async (type, facingMode = null) => {
    try {
      let constraints = {};
      
      if (type === 'builtin') {
        constraints = {
          video: facingMode ? { facingMode } : true,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        };
      } else if (type === 'rtsp') {
        // Handle RTSP stream
        const stream = await connectToRTSP(rtspUrl);
        onSelect(stream);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      onSelect(stream);
      setShowOptions(false);
    } catch (error) {
      console.error('Camera selection error:', error);
      toast.error('Failed to access camera');
    }
  };

  const connectToRTSP = async (url) => {
    try {
      const response = await fetch('/api/connect-rtsp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      return await response.json();
    } catch (error) {
      throw new Error('Failed to connect to RTSP stream');
    }
  };

  if (!showOptions) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Select Camera Source</h2>
        
        <div className="space-y-4">
          {isMobile && (
            <>
              <button
                onClick={() => handleCameraSelect('builtin', 'environment')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <span>📱</span>
                <span>Back Camera</span>
              </button>
              
              <button
                onClick={() => handleCameraSelect('builtin', 'user')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <span>🤳</span>
                <span>Front Camera</span>
              </button>
            </>
          )}
          
          {!isMobile && (
            <button
              onClick={() => handleCameraSelect('builtin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
            >
              <span>💻</span>
              <span>Built-in Camera</span>
            </button>
          )}

          <button
            onClick={() => {
              const url = prompt('Enter RTSP URL (e.g., rtsp://username:password@ip:port/stream)');
              if (url) handleCameraSelect('rtsp', url);
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
          >
            <span>📹</span>
            <span>CCTV (RTSP)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraSelector;