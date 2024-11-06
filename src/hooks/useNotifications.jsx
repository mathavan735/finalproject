import { useCallback } from 'react';
import toast from 'react-hot-toast';

const useNotifications = () => {
  const notifyDetection = useCallback((object, confidence) => {
    const toastId = `${object}_${Date.now()}`;
    
    toast(
      (t) => (
        <div className="flex items-center space-x-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-bold">{object}</h3>
            <p className="text-sm">Confidence: {confidence}%</p>
          </div>
        </div>
      ),
      {
        id: toastId,
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#fff',
          border: '1px solid #374151',
        },
        position: 'top-right',
      }
    );

    // Trigger system notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Detection Alert', {
        body: `${object} (${confidence}% confidence)`,
        icon: '/watchdog-logo.png',
        tag: toastId,
      });
    }

    // Vibrate if available
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  const notifyError = useCallback((message) => {
    toast.error(message, {
      duration: 5000,
      style: {
        background: '#991B1B',
        color: '#fff',
        border: '1px solid #7F1D1D',
      },
      position: 'top-right',
    });
  }, []);

  return { notifyDetection, notifyError };
};

export default useNotifications;