import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as cocossd from '@tensorflow-models/coco-ssd';
import WebcamView from './WebcamView';
import DetectionPanel from './DetectionPanel';
import { drawDetections } from '../utils/drawing';
import useAlarmSound from '../hooks/useAlarmSound';
import useNotifications from '../hooks/useNotifications';

const SUSPICIOUS_ITEMS = ['cell phone', 'book', 'laptop', 'remote', 'keyboard', 'mouse'];

function ExamMode() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionRef = useRef(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [currentDetections, setCurrentDetections] = useState([]);
  const [detectedItems, setDetectedItems] = useState(new Set());
  const { playAlarm } = useAlarmSound();
  const { notifyDetection, notifyError } = useNotifications();

  useEffect(() => {
    const initTF = async () => {
      try {
        await tf.ready();
        await tf.setBackend('webgl');
        const loadedModel = await cocossd.load({
          base: 'mobilenet_v2'
        });
        setModel(loadedModel);
        setLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        notifyError('Failed to load detection model');
      }
    };

    initTF();

    return () => {
      if (detectionRef.current) {
        cancelAnimationFrame(detectionRef.current);
      }
    };
  }, []);

  const detect = async () => {
    if (!model || !webcamRef.current?.video || !canvasRef.current) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;

    // Ensure video is ready
    if (video.readyState !== 4) {
      detectionRef.current = requestAnimationFrame(detect);
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const predictions = await model.detect(video, {
        maxNumBoxes: 20,
        minScore: 0.6,
        iouThreshold: 0.5
      });
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawDetections(predictions, ctx);

      // Check for suspicious items
      const suspiciousItems = predictions.filter(pred => 
        SUSPICIOUS_ITEMS.some(item => pred.class.toLowerCase().includes(item)) &&
        pred.score > 0.7
      );

      // Only notify for new detections
      suspiciousItems.forEach(item => {
        const itemId = `${item.class}_${Math.round(item.bbox[0])}_${Math.round(item.bbox[1])}`;
        if (!detectedItems.has(itemId)) {
          setDetectedItems(prev => new Set([...prev, itemId]));
          playAlarm();
          notifyDetection(`Suspicious item detected: ${item.class}`, Math.round(item.score * 100));
          
          setRecentAlerts(prev => [
            `${item.class} detected (${Math.round(item.score * 100)}% confidence)`,
            ...prev.slice(0, 4)
          ]);
        }
      });

      setCurrentDetections(predictions.map(pred => ({
        label: pred.class,
        confidence: Math.round(pred.score * 100)
      })));

      // Clear old detections after 5 seconds
      setTimeout(() => {
        setDetectedItems(new Set());
      }, 5000);

      detectionRef.current = requestAnimationFrame(detect);
    } catch (error) {
      console.error('Detection error:', error);
      notifyError('Detection error - Restarting...');
      
      setTimeout(() => {
        detectionRef.current = requestAnimationFrame(detect);
      }, 1000);
    }
  };

  useEffect(() => {
    if (webcamRef.current?.video && model && !loading) {
      detect();
    }
    
    return () => {
      if (detectionRef.current) {
        cancelAnimationFrame(detectionRef.current);
      }
    };
  }, [webcamRef.current, model, loading]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Exam Monitoring Mode</h1>
        
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
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
                <p className="text-center text-sm">
                  Monitoring for suspicious items during exam
                </p>
              </div>
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

export default ExamMode;