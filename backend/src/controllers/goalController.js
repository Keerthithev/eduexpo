import Goal from '../models/Goal.js';

// @desc    Get user's goal
// @route   GET /api/goal
// @access  Private
export const getGoal = async (req, res) => {
  try {
    let goal = await Goal.findOne({ user: req.user.id });

    if (!goal) {
      // Create default goal if none exists
      goal = await Goal.create({
        user: req.user.id,
        title: 'My Learning Goal',
        description: 'Start tracking your learning journey'
      });
    }

    res.json({ success: true, goal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create or update goal
// @route   POST /api/goal
// @access  Private
export const createOrUpdateGoal = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Check if goal exists
    let goal = await Goal.findOne({ user: req.user.id });

    if (goal) {
      // Update existing goal
      goal.title = title || goal.title;
      goal.description = description !== undefined ? description : goal.description;
      await goal.save();
    } else {
      // Create new goal
      goal = await Goal.create({
        user: req.user.id,
        title,
        description
      });
    }

    res.json({ success: true, goal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update goal
// @route   PUT /api/goal
// @access  Private
export const updateGoal = async (req, res) => {
  try {
    const { title, description } = req.body;

    const goal = await Goal.findOne({ user: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    goal.title = title || goal.title;
    goal.description = description !== undefined ? description : goal.description;
    await goal.save();

    res.json({ success: true, goal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goal
// @access  Private
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ user: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    // Delete all topics associated with the goal
    await import('../models/Topic.js').then(mod => mod.default).then(Topic => 
      Topic.deleteMany({ user: req.user.id })
    );

    await goal.deleteOne();

    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

