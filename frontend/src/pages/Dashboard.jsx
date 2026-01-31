import { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [goal, setGoal] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', description: '' });

  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicForm, setTopicForm] = useState({ name: '', startDate: '', endDate: '', subtasks: [] });

  const [editingGoal, setEditingGoal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  useEffect(() => { fetchData(); }, []);

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
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
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
    setError(''); setSuccess('');
    try {
      const response = await api.post('/topic', { 
        name: topicForm.name, 
        goalId: goal._id,
        startDate: topicForm.startDate,
        endDate: topicForm.endDate,
        subtasks: topicForm.subtasks.map(name => ({ name, status: 'pending' }))
      });
      setTopics([response.data.topic, ...topics]);
      setTopicForm({ name: '', startDate: '', endDate: '', subtasks: [] });
      setShowTopicForm(false);
      setSuccess('Topic added successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add topic');
    }
  };

  const handleToggleTopic = async (topicId) => {
    try {
      const response = await api.put(`/topic/${topicId}/toggle`);
      setTopics(topics.map(t => t._id === topicId ? response.data.topic : t));
    } catch {
      setError('Failed to update topic');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;
    try {
      await api.delete(`/topic/${topicId}`);
      setTopics(topics.filter(t => t._id !== topicId));
      setSuccess('Topic deleted');
    } catch {
      setError('Failed to delete topic');
    }
  };

  const handleToggleSubtask = (topicId, subtaskId) => {
    const updatedTopics = topics.map(topic => {
      if (topic._id !== topicId) return topic;
      const updatedSubtasks = topic.subtasks.map(sub => 
        sub._id === subtaskId ? { ...sub, status: sub.status === 'completed' ? 'pending' : 'completed' } : sub
      );
      return { ...topic, subtasks: updatedSubtasks };
    });
    setTopics(updatedTopics);
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1B263B]"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#F8F9FA]">

      {/* Alerts */}
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-[#FF6B6B]/10 border border-[#FF6B6B] text-[#FF6B6B]">{error}</div>}
      {success && <div className="mb-4 px-4 py-3 rounded-lg bg-[#06D6A0]/20 border border-[#06D6A0] text-[#1B263B]">{success}</div>}

      {/* Goal Section */}
      <div className="card mb-8 bg-[#F8F9FA] border border-[#415A77] p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1B263B]">My Learning Goal</h2>
            {goal && <p className="text-[#415A77] mt-2">{goal.title}</p>}
            {goal?.description && <p className="text-[#415A77]/70 mt-1">{goal.description}</p>}
          </div>
          <button
            onClick={() => { setEditingGoal(!editingGoal); setShowGoalForm(!showGoalForm); }}
            className="px-3 py-1 rounded-lg bg-[#415A77] text-[#F8F9FA] text-sm hover:bg-[#1B263B]"
          >
            {editingGoal ? 'Cancel' : 'Edit Goal'}
          </button>
        </div>

        {showGoalForm && (
          <form onSubmit={handleUpdateGoal} className="space-y-4 pt-4 border-t border-[#415A77]/50">
            <div>
              <label className="block text-sm font-medium text-[#1B263B] mb-1">Goal Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#415A77] rounded-lg focus:border-[#06D6A0] outline-none"
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1B263B] mb-1">Description</label>
              <textarea
                rows="3"
                className="w-full px-3 py-2 border border-[#415A77] rounded-lg focus:border-[#06D6A0] outline-none"
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
              />
            </div>
            <button type="submit" className="px-4 py-2 rounded-lg bg-[#1B263B] text-[#F8F9FA] hover:bg-[#415A77]">
              Save Goal
            </button>
          </form>
        )}
      </div>

      {/* Topics Section */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-[#1B263B]">My Topics</h3>
        <button
          onClick={() => setShowTopicForm(!showTopicForm)}
          className="px-4 py-2 rounded-lg bg-[#1B263B] text-[#F8F9FA] hover:bg-[#415A77]"
        >
          {showTopicForm ? 'Cancel' : '+ Add Topic'}
        </button>
      </div>

      {/* Add Topic Form */}
      {showTopicForm && (
        <form onSubmit={handleAddTopic} className="mb-6 bg-[#F8F9FA] p-4 border border-[#415A77] rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Topic Name"
            className="w-full px-3 py-2 border border-[#415A77] rounded-lg focus:border-[#06D6A0] outline-none"
            value={topicForm.name}
            onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="date"
              className="w-full px-3 py-2 border border-[#415A77] rounded-lg focus:border-[#06D6A0] outline-none"
              value={topicForm.startDate}
              onChange={(e) => setTopicForm({ ...topicForm, startDate: e.target.value })}
              placeholder="Start Date"
            />
            <input
              type="date"
              className="w-full px-3 py-2 border border-[#415A77] rounded-lg focus:border-[#06D6A0] outline-none"
              value={topicForm.endDate}
              onChange={(e) => setTopicForm({ ...topicForm, endDate: e.target.value })}
              placeholder="End Date"
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-[#1B263B] mb-1">Subtasks</label>
            {topicForm.subtasks.map((sub, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  className="flex-1 px-2 py-1 border border-[#415A77] rounded-lg focus:border-[#06D6A0] outline-none"
                  value={sub}
                  placeholder={`Subtask ${i + 1}`}
                  onChange={(e) => {
                    const updated = [...topicForm.subtasks];
                    updated[i] = e.target.value;
                    setTopicForm({ ...topicForm, subtasks: updated });
                  }}
                />
                <button type="button" className="px-2 py-1 bg-[#415A77] text-[#F8F9FA] rounded-lg hover:bg-[#1B263B]"
                  onClick={() => setTopicForm({ ...topicForm, subtasks: topicForm.subtasks.filter((_, index) => index !== i) })}>
                  ❌
                </button>
              </div>
            ))}
            <button type="button" className="px-3 py-1 bg-[#06D6A0] text-[#1B263B] rounded-lg hover:bg-[#1B263B] hover:text-[#06D6A0]"
              onClick={() => setTopicForm({ ...topicForm, subtasks: [...topicForm.subtasks, ''] })}>
              + Add Subtask
            </button>
          </div>

          <button type="submit" className="w-full px-4 py-2 rounded-lg bg-[#1B263B] text-[#F8F9FA] hover:bg-[#415A77]">
            Add Topic
          </button>
        </form>
      )}

      {/* Topics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map(topic => {
          const subtaskCompleted = topic.subtasks?.filter(s => s.status === 'completed').length || 0;
          const subtaskTotal = topic.subtasks?.length || 0;
          const subtaskProgress = subtaskTotal ? Math.round((subtaskCompleted / subtaskTotal) * 100) : 0;
          const isOverdue = topic.endDate && new Date(topic.endDate) < new Date() && topic.status !== 'completed';

          return (
            <div key={topic._id} className={`bg-[#F8F9FA] p-4 rounded-lg shadow hover:shadow-lg transition relative border ${isOverdue ? 'border-red-500' : 'border-[#415A77]'}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-bold text-lg ${topic.status === 'completed' ? 'line-through text-[#415A77]/70' : 'text-[#1B263B]'}`}>
                  {topic.name}
                </h4>
                <button onClick={() => handleDeleteTopic(topic._id)} className="text-red-600 hover:text-red-800">🗑️</button>
              </div>
              <div className="text-sm text-[#415A77] mb-2 flex justify-between">
                <span>Start: {formatDate(topic.startDate)}</span>
                <span>End: {formatDate(topic.endDate)}</span>
              </div>
              {/* Topic Status */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${topic.status === 'completed' ? 'bg-[#06D6A0] text-[#1B263B]' : isOverdue ? 'bg-red-100 text-red-600' : 'bg-[#415A77] text-[#F8F9FA]'}`}>
                  {topic.status}
                </span>
                <span className="text-xs text-[#415A77]">{subtaskProgress}% subtasks</span>
              </div>
              {/* Subtasks */}
              <div className="space-y-1 mb-2">
                {topic.subtasks?.map(sub => (
                  <div key={sub._id} className="flex items-center gap-2">
                    <input type="checkbox" checked={sub.status === 'completed'} onChange={() => handleToggleSubtask(topic._id, sub._id)} className="h-4 w-4 text-[#06D6A0]" />
                    <span className={`${sub.status === 'completed' ? 'line-through text-[#415A77]/70' : 'text-[#1B263B]'}`}>{sub.name}</span>
                  </div>
                ))}
              </div>
              {/* Progress Bar */}
              {subtaskTotal > 0 && (
                <div className="w-full h-2 bg-[#415A77]/30 rounded-full mt-2">
                  <div className="h-2 rounded-full bg-[#06D6A0]" style={{ width: `${subtaskProgress}%` }}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
