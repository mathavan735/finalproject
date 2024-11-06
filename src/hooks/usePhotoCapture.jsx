import { useCallback } from 'react';

const usePhotoCapture = () => {
  const captureFrame = useCallback((videoElement) => {
    if (!videoElement) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);
    
    return canvas.toDataURL('image/jpeg');
  }, []);

  const sendAlert = useCallback(async (photoData, detectionInfo) => {
    // In a real application, you would send this to your backend
    console.log('Alert sent with photo and detection:', {
      photo: photoData,
      detection: detectionInfo
    });
    
    // Simulate sending to a service
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }, []);

  return { captureFrame, sendAlert };
};

export default usePhotoCapture;