import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as cocossd from '@tensorflow-models/coco-ssd';
import WebcamView from './WebcamView';
import DetectionPanel from './DetectionPanel';
import { drawDetections } from '../utils/drawing';
import useAlarmSound from '../hooks/useAlarmSound';
import useNotifications from '../hooks/useNotifications';

function CollegeMode() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionRef = useRef(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [currentDetections, setCurrentDetections] = useState([]);
  const [detectedPersons, setDetectedPersons] = useState(new Set());
  const { playAlarm } = useAlarmSound();
  const { notifyDetection, notifyError } = useNotifications();

  // Initialize TensorFlow and load model
  useEffect(() => {
    const initTF = async () => {
      try {
        await tf.ready();
        await tf.setBackend('webgl');
        const loadedModel = await cocossd.load({
          base: 'mobilenet_v2',
          modelUrl: 'https://storage.googleapis.com/tfjs-models/savedmodel/ssd_mobilenet_v2/model.json'
        });
        setModel(loadedModel);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing TensorFlow:', error);
        notifyError('Failed to initialize detection system');
        setLoading(false);
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
    if (!model || !webcamRef.current?.video || !canvasRef.current) {
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;

    // Ensure video is ready
    if (video.readyState !== 4) {
      detectionRef.current = requestAnimationFrame(detect);
      return;
    }

    try {
      // Update canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Run detection
      const predictions = await model.detect(video, {
        maxNumBoxes: 20,
        minScore: 0.5,
        iouThreshold: 0.5
      });
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawDetections(predictions, ctx);

      // Process detections
      const persons = predictions.filter(pred => 
        pred.class.toLowerCase() === 'person' && pred.score > 0.7
      );

      const idCards = predictions.filter(pred => 
        (pred.class.toLowerCase().includes('card') || 
         pred.class.toLowerCase().includes('id') ||
         pred.class.toLowerCase().includes('book')) &&
        pred.score > 0.5
      );

      // Check for persons without ID cards
      persons.forEach(person => {
        const [x, y, width, height] = person.bbox;
        const personId = `person_${Math.round(x)}_${Math.round(y)}`;

        if (!detectedPersons.has(personId) && idCards.length === 0) {
          setDetectedPersons(prev => new Set([...prev, personId]));
          playAlarm();
          notifyDetection('Person detected without ID card', Math.round(person.score * 100));
          
          // Add to recent alerts
          setRecentAlerts(prev => [
            `Person without ID detected (${Math.round(person.score * 100)}% confidence)`,
            ...prev.slice(0, 4)
          ]);
        }
      });

      // Update current detections display
      setCurrentDetections(predictions.map(pred => ({
        label: pred.class,
        confidence: Math.round(pred.score * 100)
      })));

      // Continue detection loop
      detectionRef.current = requestAnimationFrame(detect);
    } catch (error) {
      console.error('Detection error:', error);
      notifyError('Detection system error - Restarting...');
      
      // Attempt to recover
      setTimeout(() => {
        detectionRef.current = requestAnimationFrame(detect);
      }, 1000);
    }
  };

  // Start detection when video and model are ready
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
        <h1 className="text-3xl font-bold mb-8 text-center">College Entry Monitoring</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Initializing detection system...</p>
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
                  Monitoring for persons without ID cards
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

export default CollegeMode;