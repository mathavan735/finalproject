import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import WebcamView from './WebcamView';
import DetectionPanel from './DetectionPanel';
import { drawDetections } from '../utils/drawing';
import useAlarmSound from '../hooks/useAlarmSound';
import useNotifications from '../hooks/useNotifications';

function CameraMode() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [currentDetections, setCurrentDetections] = useState([]);
  const [targetObject, setTargetObject] = useState('person');
  const { playAlarm } = useAlarmSound();
  const { notifyDetection, notifyError } = useNotifications();

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        setLoading(false);
      } catch (error) {
        console.error("Error loading model:", error);
        notifyError("Failed to load detection model");
      }
    };
    loadModel();
  }, []);

  const detect = async () => {
    if (!model || !webcamRef.current?.video) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      const predictions = await model.detect(video);
      
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawDetections(predictions, ctx);

      const targetDetection = predictions.find(pred => pred.class.toLowerCase() === targetObject.toLowerCase());
      if (targetDetection) {
        playAlarm();
        notifyDetection(targetObject, Math.round(targetDetection.score * 100));
      }

      const detections = predictions.map(pred => ({
        label: pred.class,
        confidence: Math.round(pred.score * 100)
      }));
      setCurrentDetections(detections);

      const newAlerts = predictions.map(pred => 
        `${pred.class} detected with ${Math.round(pred.score * 100)}% confidence`
      );
      setRecentAlerts(prev => [...newAlerts, ...prev].slice(0, 5));

      requestAnimationFrame(detect);
    } catch (error) {
      console.error("Detection error:", error);
      notifyError("Error during object detection");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Camera Mode Detection</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Loading model...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <WebcamView 
                webcamRef={webcamRef}
                canvasRef={canvasRef}
                onLoadedData={detect}
              />
              <div className="bg-gray-800 p-4 rounded-lg">
                <label className="block text-sm font-medium mb-2">Target Object</label>
                <input
                  type="text"
                  value={targetObject}
                  onChange={(e) => setTargetObject(e.target.value)}
                  placeholder="Enter object to detect (e.g., person, cell phone)"
                  className="bg-gray-700 text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <DetectionPanel 
              recentAlerts={recentAlerts}
              currentDetections={currentDetections}
              targetObject={targetObject}
              onTargetChange={setTargetObject}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CameraMode;