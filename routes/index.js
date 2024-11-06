import { Router } from 'express';
import { Stream } from '../models/Stream.js';

export const setupRoutes = (app, streamManager) => {
  const router = Router();

  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Get all streams
  router.get('/streams', async (req, res) => {
    try {
      const streams = await Stream.find();
      res.json(streams);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch streams' });
    }
  });

  // Add new stream
  router.post('/streams', async (req, res) => {
    try {
      const stream = new Stream(req.body);
      await stream.save();
      await streamManager.connectToStream(stream.url, stream._id);
      res.status(201).json(stream);
    } catch (error) {
      res.status(400).json({ error: 'Failed to add stream' });
    }
  });

  // Delete stream
  router.delete('/streams/:id', async (req, res) => {
    try {
      await Stream.findByIdAndDelete(req.params.id);
      streamManager.removeStream(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete stream' });
    }
  });

  app.use('/api', router);
};