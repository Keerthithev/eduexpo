import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a topic name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.model('Topic', topicSchema);

