import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import WebcamView from './WebcamView';
import { drawDetections } from '../utils/drawing';
import useAudioFeedback from '../hooks/useAudioFeedback';
import useNotifications from '../hooks/useNotifications';

const CRITICAL_OBJECTS = ['car', 'truck', 'motorcycle', 'bicycle', 'person', 'hole', 'pothole'];

function BlindMode() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { speak, getDirectionalGuidance } = useAudioFeedback();
  const { notifyError } = useNotifications();

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        setLoading(false);
        speak('Blind assistance mode activated. I will help you navigate safely.');
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

      // Process critical detections for audio feedback
      predictions
        .filter(pred => CRITICAL_OBJECTS.includes(pred.class.toLowerCase()))
        .forEach(pred => {
          const direction = getDirectionalGuidance(pred.bbox, canvas.width, canvas.height);
          const distance = pred.score > 0.8 ? 'very close' : pred.score > 0.6 ? 'nearby' : 'in the distance';
          speak(`${pred.class} detected ${direction}, ${distance}`);
        });

      requestAnimationFrame(detect);
    } catch (error) {
      console.error("Detection error:", error);
      notifyError("Error during object detection");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Blind Assistance Mode</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Loading assistance system...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <WebcamView 
                webcamRef={webcamRef}
                canvasRef={canvasRef}
                onLoadedData={detect}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
                <p className="text-center">
                  Audio feedback enabled. You will hear notifications about obstacles and surroundings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlindMode;