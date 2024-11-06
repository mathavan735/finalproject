import { useCallback, useRef, useEffect } from 'react';

const AUDIO_FORMATS = [
  { type: 'audio/mpeg', ext: 'mp3' },
  { type: 'audio/wav', ext: 'wav' },
  { type: 'audio/ogg', ext: 'ogg' }
];

const useAlarmSound = () => {
  const audioRef = useRef(null);
  const audioLoaded = useRef(false);
  const lastPlayedRef = useRef(0);
  const MIN_INTERVAL = 3000; // Minimum time between alarms in milliseconds

  useEffect(() => {
    const loadAudio = async () => {
      if (!audioLoaded.current) {
        for (const format of AUDIO_FORMATS) {
          try {
            const audio = new Audio(`/alarm.${format.ext}`);
            audio.volume = 0.7; // Set volume to 70%
            await new Promise((resolve, reject) => {
              audio.addEventListener('canplaythrough', resolve, { once: true });
              audio.addEventListener('error', reject, { once: true });
              audio.load();
            });
            audioRef.current = audio;
            audioLoaded.current = true;
            break;
          } catch (error) {
            console.warn(`Failed to load ${format.ext} format:`, error);
          }
        }
      }
    };

    loadAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        audioLoaded.current = false;
      }
    };
  }, []);

  const playAlarm = useCallback(async () => {
    const now = Date.now();
    if (now - lastPlayedRef.current < MIN_INTERVAL) {
      return; // Skip if played too recently
    }

    try {
      if (!audioRef.current && !audioLoaded.current) {
        // Fallback to browser notification if audio isn't available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Alert!', {
            body: 'Detection Alert',
            icon: '/watchdog-logo.png'
          });
          return;
        }
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          lastPlayedRef.current = now;
        }
      }
    } catch (error) {
      console.error('Error playing alarm:', error);
      // Fallback to vibration if available
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, []);

  return { playAlarm };
};

export default useAlarmSound;