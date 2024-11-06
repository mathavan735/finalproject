import mongoose from 'mongoose';

const streamSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['cctv', 'exam', 'college'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'inactive'
  },
  lastActive: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Stream = mongoose.model('Stream', streamSchema);