import ffmpeg from 'fluent-ffmpeg';
import { Transform } from 'stream';

export class RTSPHandler {
  constructor(io) {
    this.io = io;
    this.streams = new Map();
  }

  handleConnection(socket) {
    socket.on('connect-rtsp', async ({ url }) => {
      try {
        const streamId = this.generateStreamId();
        const stream = await this.createRTSPStream(url, streamId);
        
        this.streams.set(streamId, stream);
        socket.emit('rtsp-connected', { streamId, stream });
      } catch (error) {
        socket.emit('rtsp-error', { message: error.message });
      }
    });

    socket.on('disconnect-rtsp', ({ streamId }) => {
      this.closeStream(streamId);
    });
  }

  generateStreamId() {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async createRTSPStream(url, streamId) {
    return new Promise((resolve, reject) => {
      try {
        const stream = ffmpeg(url)
          .format('mp4')
          .videoCodec('libx264')
          .on('error', (err) => {
            console.error(`Stream ${streamId} error:`, err);
            this.closeStream(streamId);
            reject(err);
          });

        const transform = new Transform({
          transform(chunk, encoding, callback) {
            this.push(chunk);
            callback();
          }
        });

        stream.pipe(transform);
        resolve({ stream, transform });
      } catch (error) {
        reject(error);
      }
    });
  }

  closeStream(streamId) {
    const stream = this.streams.get(streamId);
    if (stream) {
      stream.stream.kill();
      stream.transform.destroy();
      this.streams.delete(streamId);
    }
  }
}