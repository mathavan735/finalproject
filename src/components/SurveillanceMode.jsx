import React from 'react';
import CCTVMode from './CCTVMode';
import usePhotoCapture from '../hooks/usePhotoCapture';

const SurveillanceMode = () => {
  const { captureFrame, sendAlert } = usePhotoCapture();

  const handleDetection = async (confidence, videoRef) => {
    if (!videoRef.current) return;

    const photoData = captureFrame(videoRef.current);
    if (photoData) {
      await sendAlert(photoData, {
        type: 'person_detected',
        confidence,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <CCTVMode 
      targetObject="person"
      mode="surveillance"
      onDetection={handleDetection}
      title="Surveillance Mode"
      description="Advanced person detection with photo alerts"
    />
  );
};

export default SurveillanceMode;