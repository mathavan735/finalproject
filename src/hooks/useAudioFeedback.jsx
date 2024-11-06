import { useCallback } from 'react';

const useAudioFeedback = () => {
  const speak = useCallback((text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2;
    window.speechSynthesis.speak(utterance);
  }, []);

  const getDirectionalGuidance = useCallback((bbox, canvasWidth, canvasHeight) => {
    const [x, y, width, height] = bbox;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    const horizontalPosition = centerX < canvasWidth / 3 ? 'left' 
      : centerX > (2 * canvasWidth) / 3 ? 'right' 
      : 'center';
    
    const verticalPosition = centerY < canvasHeight / 3 ? 'above' 
      : centerY > (2 * canvasHeight) / 3 ? 'below' 
      : 'ahead';

    return `${horizontalPosition} ${verticalPosition}`;
  }, []);

  return { speak, getDirectionalGuidance };
};

export default useAudioFeedback;