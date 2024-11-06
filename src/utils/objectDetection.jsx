import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as cocossd from '@tensorflow-models/coco-ssd';

export class AdvancedObjectDetector {
  constructor() {
    this.model = null;
    this.confidenceThreshold = 0.98;
    this.isInitialized = false;
    this.detectionHistory = new Map();
  }

  async initialize() {
    try {
      await tf.ready();
      await tf.setBackend('webgl');
      
      // Load model with custom configuration
      this.model = await cocossd.load({
        base: 'mobilenet_v2',
        modelUrl: 'https://storage.googleapis.com/tfjs-models/savedmodel/ssd_mobilenet_v2/model.json',
        warmup: true // Warm up the model for better initial performance
      });

      this.isInitialized = true;
      this.detectionHistory.clear();
    } catch (error) {
      console.error('Model initialization error:', error);
      throw error;
    }
  }

  async detect(image) {
    if (!this.isInitialized) {
      throw new Error('Detector not initialized');
    }

    try {
      // Prepare image
      const normalizedImage = await this.preprocessImage(image);
      
      // Run detection with enhanced settings
      const predictions = await this.model.detect(normalizedImage, {
        maxNumBoxes: 100, // Increase max detections
        minScore: 0.3, // Lower initial threshold for better recall
        iouThreshold: 0.5 // NMS threshold
      });

      // Apply post-processing
      const enhancedResults = await this.enhanceDetections(predictions, normalizedImage);
      
      // Apply temporal consistency
      const finalResults = this.applyTemporalConsistency(enhancedResults);

      // Cleanup
      tf.dispose(normalizedImage);

      return finalResults;
    } catch (error) {
      console.error('Detection error:', error);
      throw error;
    }
  }

  async preprocessImage(image) {
    return tf.tidy(() => {
      // Convert to tensor
      const tensor = tf.browser.fromPixels(image);
      
      // Normalize and enhance
      const normalized = tf.div(tf.cast(tensor, 'float32'), 255);
      
      // Apply image enhancement
      return this.enhanceImageQuality(normalized);
    });
  }

  enhanceImageQuality(imageTensor) {
    return tf.tidy(() => {
      // Apply contrast enhancement
      const mean = tf.mean(imageTensor);
      const std = tf.moments(imageTensor).variance.sqrt();
      const normalized = imageTensor.sub(mean).div(std);
      
      // Apply noise reduction
      return this.applyGaussianFilter(normalized);
    });
  }

  applyGaussianFilter(tensor) {
    return tf.tidy(() => {
      const kernel = tf.tensor2d([
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1]
      ]).div(16);
      
      return tf.conv2d(
        tensor.expandDims(),
        kernel.expandDims(2).expandDims(2),
        [1, 1],
        'same'
      ).squeeze();
    });
  }

  async enhanceDetections(predictions, image) {
    const enhanced = [];
    
    for (const pred of predictions) {
      if (pred.score > this.confidenceThreshold) {
        // Analyze ROI for additional confidence
        const roiConfidence = await this.analyzeROI(pred.bbox, image);
        
        // Combine confidences
        const finalConfidence = (pred.score + roiConfidence) / 2;
        
        if (finalConfidence > this.confidenceThreshold) {
          enhanced.push({
            ...pred,
            score: finalConfidence,
            confidence: finalConfidence
          });
        }
      }
    }

    return this.applyNMS(enhanced);
  }

  async analyzeROI(bbox, image) {
    const [x, y, width, height] = bbox;
    
    return tf.tidy(() => {
      // Extract ROI
      const roi = tf.image.cropAndResize(
        image.expandDims(),
        [[y, x, y + height, x + width]],
        [0],
        [224, 224]
      );

      // Analyze ROI features
      const features = tf.max(roi);
      return features.dataSync()[0];
    });
  }

  applyNMS(detections, iouThreshold = 0.5) {
    return detections.reduce((selected, detection) => {
      const shouldSelect = selected.every(
        selected => this.calculateIoU(selected.bbox, detection.bbox) < iouThreshold
      );

      if (shouldSelect) {
        selected.push(detection);
      }

      return selected;
    }, []);
  }

  calculateIoU(box1, box2) {
    const [x1, y1, w1, h1] = box1;
    const [x2, y2, w2, h2] = box2;

    const intersectionX = Math.max(0, Math.min(x1 + w1, x2 + w2) - Math.max(x1, x2));
    const intersectionY = Math.max(0, Math.min(y1 + h1, y2 + h2) - Math.max(y1, y2));
    const intersection = intersectionX * intersectionY;

    const union = w1 * h1 + w2 * h2 - intersection;

    return intersection / union;
  }

  applyTemporalConsistency(currentDetections) {
    const timestamp = Date.now();
    const consistentDetections = [];

    for (const detection of currentDetections) {
      const key = `${detection.class}_${Math.round(detection.bbox[0])}_${Math.round(detection.bbox[1])}`;
      const history = this.detectionHistory.get(key) || [];

      // Update history
      history.push({
        confidence: detection.confidence,
        timestamp
      });

      // Remove old entries
      const recentHistory = history.filter(h => timestamp - h.timestamp < 1000);
      this.detectionHistory.set(key, recentHistory);

      // Calculate temporal confidence
      if (recentHistory.length >= 3) {
        const avgConfidence = recentHistory.reduce((sum, h) => sum + h.confidence, 0) / recentHistory.length;
        if (avgConfidence > this.confidenceThreshold) {
          consistentDetections.push({
            ...detection,
            confidence: avgConfidence
          });
        }
      }
    }

    return consistentDetections;
  }
}

export const createDetector = async () => {
  const detector = new AdvancedObjectDetector();
  await detector.initialize();
  return detector;
};