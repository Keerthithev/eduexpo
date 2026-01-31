import Topic from '../models/Topic.js';

// @desc    Get all topics for user's goal
// @route   GET /api/topic
// @access  Private
export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, topics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create topic
// @route   POST /api/topic
// @access  Private
export const createTopic = async (req, res) => {
  try {
    const { name, goalId } = req.body;

    const topic = await Topic.create({
      user: req.user.id,
      goal: goalId,
      name
    });

    res.status(201).json({ success: true, topic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update topic
// @route   PUT /api/topic/:id
// @access  Private
export const updateTopic = async (req, res) => {
  try {
    const { name, status } = req.body;

    let topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    // Make sure user owns the topic
    if (topic.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    topic.name = name || topic.name;
    if (status) {
      topic.status = status;
    }
    
    await topic.save();

    res.json({ success: true, topic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete topic
// @route   DELETE /api/topic/:id
// @access  Private
export const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    // Make sure user owns the topic
    if (topic.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await topic.deleteOne();

    res.json({ success: true, message: 'Topic deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle topic status
// @route   PUT /api/topic/:id/toggle
// @access  Private
export const toggleTopicStatus = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    // Make sure user owns the topic
    if (topic.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    topic.status = topic.status === 'pending' ? 'completed' : 'pending';
    await topic.save();

    res.json({ success: true, topic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

