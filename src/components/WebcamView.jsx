import React, { useEffect } from 'react';
import Webcam from 'react-webcam';

const WebcamView = ({ webcamRef, canvasRef, onLoadedData }) => {
  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: { ideal: 'environment' },
    aspectRatio: 16/9
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && webcamRef.current?.stream) {
        const tracks = webcamRef.current.stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [webcamRef]);

  return (
    <div className="relative w-full h-full">
      <Webcam
        ref={webcamRef}
        muted={true}
        className="w-full h-full object-cover rounded-lg"
        videoConstraints={videoConstraints}
        onLoadedData={onLoadedData}
        onUserMediaError={(err) => console.error('Camera error:', err)}
        screenshotFormat="image/jpeg"
        forceScreenshotSourceSize
        screenshotQuality={1}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default WebcamView;