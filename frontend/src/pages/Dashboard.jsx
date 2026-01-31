import { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [goal, setGoal] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Goal form state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: ''
  });

  // Topic form state
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicForm, setTopicForm] = useState({
    name: ''
  });

  // Edit states
  const [editingGoal, setEditingGoal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [goalRes, topicsRes] = await Promise.all([
        api.get('/goal'),
        api.get('/topic')
      ]);
      setGoal(goalRes.data.goal);
      setTopics(topicsRes.data.topics);
      if (goalRes.data.goal) {
        setGoalForm({
          title: goalRes.data.goal.title,
          description: goalRes.data.goal.description || ''
        });
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/goal', goalForm);
      setGoal(response.data.goal);
      setSuccess('Goal updated successfully');
      setEditingGoal(false);
      setShowGoalForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update goal');
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/topic', {
        name: topicForm.name,
        goalId: goal._id
      });
      setTopics([response.data.topic, ...topics]);
      setTopicForm({ name: '' });
      setShowTopicForm(false);
      setSuccess('Topic added successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add topic');
    }
  };

  const handleToggleTopic = async (topicId) => {
    try {
      const response = await api.put(`/topic/${topicId}/toggle`);
      setTopics(topics.map(topic =>
        topic._id === topicId ? response.data.topic : topic
      ));
    } catch (err) {
      setError('Failed to update topic');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;

    try {
      await api.delete(`/topic/${topicId}`);
      setTopics(topics.filter(topic => topic._id !== topicId));
      setSuccess('Topic deleted');
    } catch (err) {
      setError('Failed to delete topic');
    }
  };

  const handleUpdateTopic = async (topicId, newName) => {
    try {
      const response = await api.put(`/topic/${topicId}`, { name: newName });
      setTopics(topics.map(topic =>
        topic._id === topicId ? response.data.topic : topic
      ));
      setEditingTopic(null);
    } catch (err) {
      setError('Failed to update topic');
    }
  };

  // Calculate statistics
  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.status === 'completed').length;
  const pendingTopics = topics.filter(t => t.status === 'pending').length;
  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Goal Section */}
      <div className="card mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Learning Goal</h2>
            {goal && (
              <p className="text-gray-600 mt-2">{goal.title}</p>
            )}
            {goal?.description && (
              <p className="text-gray-500 mt-1">{goal.description}</p>
            )}
          </div>
          <button
            onClick={() => {
              setEditingGoal(!editingGoal);
              setShowGoalForm(!showGoalForm);
            }}
            className="btn btn-secondary text-sm"
          >
            {editingGoal ? 'Cancel' : 'Edit Goal'}
          </button>
        </div>

        {showGoalForm && (
          <form onSubmit={handleUpdateGoal} className="space-y-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
              <input
                type="text"
                className="input"
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="input"
                rows="3"
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save Goal
            </button>
          </form>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{totalTopics}</div>
          <div className="text-sm text-gray-600">Total Topics</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">{completedTopics}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-600">{pendingTopics}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600">{progress}%</div>
          <div className="text-sm text-gray-600">Progress</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Topics Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">My Topics</h3>
          <button
            onClick={() => setShowTopicForm(!showTopicForm)}
            className="btn btn-primary text-sm"
          >
            {showTopicForm ? 'Cancel' : '+ Add Topic'}
          </button>
        </div>

        {showTopicForm && (
          <form onSubmit={handleAddTopic} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="Enter topic name..."
                value={topicForm.name}
                onChange={(e) => setTopicForm({ name: e.target.value })}
                required
              />
              <button type="submit" className="btn btn-primary">
                Add
              </button>
            </div>
          </form>
        )}

        {topics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-2">No topics yet. Add your first topic to start tracking!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <div
                key={topic._id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  topic.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={topic.status === 'completed'}
                    onChange={() => handleToggleTopic(topic._id)}
                    className="h-5 w-5 text-blue-600 rounded cursor-pointer"
                  />
                  {editingTopic === topic._id ? (
                    <input
                      type="text"
                      className="input flex-1"
                      defaultValue={topic.name}
                      onBlur={(e) => handleUpdateTopic(topic._id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateTopic(topic._id, e.target.value);
                        }
                        if (e.key === 'Escape') {
                          setEditingTopic(null);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`flex-1 cursor-pointer ${
                        topic.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                      onClick={() => setEditingTopic(topic._id)}
                    >
                      {topic.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    topic.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {topic.status}
                  </span>
                  <button
                    onClick={() => setEditingTopic(topic._id)}
                    className="p-2 text-gray-500 hover:text-blue-600"
                    title="Edit"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic._id)}
                    className="p-2 text-gray-500 hover:text-red-600"
                    title="Delete"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

