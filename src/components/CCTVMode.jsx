import React, { useRef, useEffect, useState } from 'react';
import * as cocossd from '@tensorflow-models/coco-ssd';
import DetectionPanel from './DetectionPanel';
import { drawDetections } from '../utils/drawing';
import useAlarmSound from '../hooks/useAlarmSound';
import useNotifications from '../hooks/useNotifications';

const CCTVMode = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
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

  const connectToCCTV = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsConnected(true);
        detect(); // Start detection after connection
      }
    } catch (error) {
      console.error("Error connecting to camera:", error);
      notifyError("Failed to connect to camera");
    }
  };

  const detect = async () => {
    if (!model || !videoRef.current?.srcObject) return;

    try {
      const predictions = await model.detect(videoRef.current);
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        drawDetections(predictions, ctx);

        const targetDetection = predictions.find(pred => 
          pred.class.toLowerCase() === targetObject.toLowerCase()
        );
        
        if (targetDetection) {
          playAlarm();
          notifyDetection(targetObject, Math.round(targetDetection.score * 100));
        }

        const detections = predictions.map(pred => ({
          label: pred.class,
          confidence: Math.round(pred.score * 100)
        }));
        
        setCurrentDetections(detections);
        setRecentAlerts(prev => [
          ...predictions.map(pred => 
            `${pred.class} detected with ${Math.round(pred.score * 100)}% confidence`
          ),
          ...prev
        ].slice(0, 5));
      }

      requestAnimationFrame(detect);
    } catch (error) {
      console.error("Detection error:", error);
      notifyError("Error during object detection");
    }
  };

  const handleDisconnect = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsConnected(false);
    setStreamUrl('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">CCTV Monitoring</h1>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Disconnect
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Loading model...</p>
          </div>
        ) : !isConnected ? (
          <div className="bg-gray-800 p-8 rounded-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Connect to Camera</h2>
            <button
              onClick={connectToCCTV}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded w-full"
            >
              Connect to Camera
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 z-10"
                style={{ width: '100%', height: '100%' }}
              />
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
};

export default CCTVMode;