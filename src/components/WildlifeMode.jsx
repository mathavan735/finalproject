import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import WebcamView from './WebcamView';
import DetectionPanel from './DetectionPanel';
import { drawDetections } from '../utils/drawing';
import useAlarmSound from '../hooks/useAlarmSound';
import useNotifications from '../hooks/useNotifications';

const DANGEROUS_ANIMALS = ['bear', 'lion', 'tiger', 'wolf', 'leopard', 'elephant', 'zebra', 'giraffe', 'cat', 'dog'];

function WildlifeMode() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [currentDetections, setCurrentDetections] = useState([]);
  const [detectedAnimals, setDetectedAnimals] = useState(new Set());
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

      // Check for dangerous animals
      const animals = predictions.filter(pred => 
        DANGEROUS_ANIMALS.includes(pred.class.toLowerCase()) && pred.score > 0.7
      );

      // Only notify for new detections
      animals.forEach(animal => {
        if (!detectedAnimals.has(animal.class)) {
          detectedAnimals.add(animal.class);
          playAlarm();
          notifyDetection(`Wildlife detected: ${animal.class}`, Math.round(animal.score * 100));
        }
      });

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
        <h1 className="text-3xl font-bold mb-8 text-center">Wildlife Safety Mode</h1>
        
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

export default WildlifeMode;