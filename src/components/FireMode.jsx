import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import WebcamView from './WebcamView';
import DetectionPanel from './DetectionPanel';
import { drawDetections } from '../utils/drawing';
import useAlarmSound from '../hooks/useAlarmSound';
import useNotifications from '../hooks/useNotifications';
import { toast } from 'react-hot-toast';

const FIRE_INDICATORS = ['smoke', 'fire', 'flame'];

function FireMode() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [currentDetections, setCurrentDetections] = useState([]);
  const [detectedFire, setDetectedFire] = useState(false);
  const { playAlarm } = useAlarmSound();
  const { notifyDetection, notifyError } = useNotifications();

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        setLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        notifyError('Failed to load detection model');
      }
    };
    loadModel();
  }, []);

  const detect = async () => {
    if (!model || !webcamRef.current?.video) return;

    try {
      const predictions = await model.detect(webcamRef.current.video);
      
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawDetections(predictions, ctx);

      // Check for fire indicators
      const fireDetected = predictions.some(pred => 
        FIRE_INDICATORS.includes(pred.class.toLowerCase()) && pred.score > 0.7
      );

      if (fireDetected && !detectedFire) {
        setDetectedFire(true);
        playAlarm();
        toast.error(
          'FIRE DETECTED! Please evacuate immediately and contact emergency services.',
          {
            duration: 10000,
            style: {
              background: '#DC2626',
              color: '#fff',
              border: '2px solid #991B1B',
            },
          }
        );
        notifyDetection('FIRE DETECTED', 100);
      }

      setCurrentDetections(predictions.map(pred => ({
        label: pred.class,
        confidence: Math.round(pred.score * 100)
      })));

      requestAnimationFrame(detect);
    } catch (error) {
      console.error('Detection error:', error);
      notifyError('Detection error occurred');
    }
  };

  useEffect(() => {
    if (webcamRef.current?.video && model) {
      detect();
    }
  }, [webcamRef.current, model]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Fire Safety Mode</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Loading detection model...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <WebcamView
                webcamRef={webcamRef}
                canvasRef={canvasRef}
              />
            </div>
            <DetectionPanel
              recentAlerts={recentAlerts}
              currentDetections={currentDetections}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FireMode;