import ffmpeg from 'fluent-ffmpeg';
import { Transform } from 'stream';

export class StreamManager {
  constructor(io) {
    this.streams = new Map();
    this.viewers = new Map();
    this.io = io;
  }

  async connectToStream(streamUrl, streamId) {
    if (this.streams.has(streamId)) {
      return;
    }

    try {
      const stream = ffmpeg(streamUrl)
        .format('mp4')
        .videoCodec('libx264')
        .on('error', (err) => {
          console.error(`Stream ${streamId} error:`, err);
          this.removeStream(streamId);
        });

      const transform = new Transform({
        transform(chunk, encoding, callback) {
          this.push(chunk);
          callback();
        }
      });

      stream.pipe(transform);
      this.streams.set(streamId, { stream, transform });
      
      transform.on('data', (chunk) => {
        const viewers = this.viewers.get(streamId) || new Set();
        viewers.forEach(socketId => {
          this.io.to(socketId).emit('stream-data', {
            streamId,
            data: chunk.toString('base64')
          });
        });
      });
    } catch (error) {
      console.error(`Failed to connect to stream ${streamId}:`, error);
      throw error;
    }
  }

  addViewer(streamId, socketId) {
    if (!this.viewers.has(streamId)) {
      this.viewers.set(streamId, new Set());
    }
    this.viewers.get(streamId).add(socketId);

    // Connect to stream if not already connected
    if (!this.streams.has(streamId)) {
      this.connectToStream(streamId);
    }
  }

  removeViewer(socketId) {
    this.viewers.forEach((viewers, streamId) => {
      viewers.delete(socketId);
      if (viewers.size === 0) {
        this.removeStream(streamId);
      }
    });
  }

  removeStream(streamId) {
    const streamData = this.streams.get(streamId);
    if (streamData) {
      streamData.stream.kill();
      streamData.transform.destroy();
      this.streams.delete(streamId);
      this.viewers.delete(streamId);
    }
  }
}