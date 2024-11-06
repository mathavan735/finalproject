import { io } from 'socket.io-client';

class RTSPService {
  constructor() {
    this.socket = io(window.location.origin);
    this.streams = new Map();
  }

  async connectToStream(url) {
    try {
      // Emit connection request to server
      this.socket.emit('connect-rtsp', { url });
      
      // Create a promise that resolves when stream is ready
      return new Promise((resolve, reject) => {
        this.socket.on('rtsp-connected', ({ streamId, stream }) => {
          this.streams.set(streamId, stream);
          resolve(stream);
        });

        this.socket.on('rtsp-error', (error) => {
          reject(new Error(error.message));
        });

        // Timeout after 10 seconds
        setTimeout(() => reject(new Error('Connection timeout')), 10000);
      });
    } catch (error) {
      throw new Error(`Failed to connect to RTSP stream: ${error.message}`);
    }
  }

  disconnectStream(streamId) {
    if (this.streams.has(streamId)) {
      this.socket.emit('disconnect-rtsp', { streamId });
      this.streams.delete(streamId);
    }
  }
}

export const rtspService = new RTSPService();