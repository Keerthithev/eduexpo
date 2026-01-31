import { useState, useEffect } from 'react';
import api from '../services/api';
import dayjs from 'dayjs';

const Dashboard = () => {
  const [goal, setGoal] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', description: '' });

  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicForm, setTopicForm] = useState({ name: '', description: '', startDate: '', endDate: '' });

  const [editingTopic, setEditingTopic] = useState(null);

  // Fetch goal and topics
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [goalRes, topicsRes] = await Promise.all([api.get('/goal'), api.get('/topic')]);
      setGoal(goalRes.data.goal);
      setTopics(topicsRes.data.topics || []);
      if (goalRes.data.goal) setGoalForm({ title: goalRes.data.goal.title, description: goalRes.data.goal.description || '' });
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Goal update
  const handleUpdateGoal = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      const res = await api.put('/goal', goalForm);
      setGoal(res.data.goal);
      setSuccess('Goal updated successfully'); setShowGoalForm(false);
    } catch {
      setError('Failed to update goal');
    }
  };

  // Add topic
  const handleAddTopic = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      const res = await api.post('/topic', { ...topicForm, goalId: goal._id });
      setTopics(prev => [res.data.topic, ...prev]); // prepend new topic
      setTopicForm({ name: '', description: '', startDate: '', endDate: '' });
      setShowTopicForm(false);
      setSuccess('Topic added successfully');
    } catch {
      setError('Failed to add topic');
    }
  };

  // Toggle complete/pending
  const handleToggleTopic = async (id) => {
    try {
      const res = await api.put(`/topic/${id}/toggle`);
      setTopics(prev => prev.map(t => t._id === id ? res.data.topic : t));
    } catch {
      setError('Failed to update topic');
    }
  };

  // Delete topic
  const handleDeleteTopic = async (id) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;
    try {
      await api.delete(`/topic/${id}`);
      setTopics(prev => prev.filter(t => t._id !== id));
      setSuccess('Topic deleted');
    } catch {
      setError('Failed to delete topic');
    }
  };

  // Update topic (inline)
  const handleUpdateTopic = async (id, updated) => {
    try {
      const res = await api.put(`/topic/${id}`, updated);
      setTopics(prev => prev.map(t => t._id === id ? res.data.topic : t));
      setEditingTopic(null);
    } catch {
      setError('Failed to update topic');
    }
  };

  // Statistics
  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.status === 'completed').length;
  const pendingTopics = totalTopics - completedTopics;
  const progress = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Alerts */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Goal */}
      <div className="card p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">My Learning Goal</h2>
            {goal && <p className="mt-2 text-gray-700">{goal.title}</p>}
            {goal?.description && <p className="mt-1 text-gray-500">{goal.description}</p>}
          </div>
          <button className="btn btn-secondary text-sm" onClick={() => setShowGoalForm(!showGoalForm)}>
            {showGoalForm ? 'Cancel' : 'Edit Goal'}
          </button>
        </div>
        {showGoalForm && (
          <form onSubmit={handleUpdateGoal} className="space-y-3 pt-3 border-t">
            <input type="text" className="input" value={goalForm.title} onChange={e => setGoalForm({ ...goalForm, title: e.target.value })} required placeholder="Goal Title" />
            <textarea className="input" rows={3} value={goalForm.description} onChange={e => setGoalForm({ ...goalForm, description: e.target.value })} placeholder="Description" />
            <button type="submit" className="btn btn-primary">Save Goal</button>
          </form>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card text-center p-4">
          <div className="text-3xl font-bold text-blue-600">{totalTopics}</div>
          <div>Total Topics</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-3xl font-bold text-green-600">{completedTopics}</div>
          <div>Completed</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-3xl font-bold text-yellow-600">{pendingTopics}</div>
          <div>Pending</div>
        </div>
        <div className="card text-center p-4">
          <div className="text-3xl font-bold text-purple-600">{progress}%</div>
          <div>Progress</div>
        </div>
      </div>

      {/* Add Topic */}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold">My Topics</h3>
          <button className="btn btn-primary text-sm" onClick={() => setShowTopicForm(!showTopicForm)}>
            {showTopicForm ? 'Cancel' : '+ Add Topic'}
          </button>
        </div>
        {showTopicForm && (
          <form onSubmit={handleAddTopic} className="space-y-2">
            <input type="text" className="input" value={topicForm.name} onChange={e => setTopicForm({ ...topicForm, name: e.target.value })} placeholder="Topic Name" required />
            <textarea className="input" rows={2} value={topicForm.description} onChange={e => setTopicForm({ ...topicForm, description: e.target.value })} placeholder="Description" />
            <div className="flex gap-2">
              <input type="date" className="input flex-1" value={topicForm.startDate} onChange={e => setTopicForm({ ...topicForm, startDate: e.target.value })} />
              <input type="date" className="input flex-1" value={topicForm.endDate} onChange={e => setTopicForm({ ...topicForm, endDate: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Add Topic</button>
          </form>
        )}
      </div>

      {/* Topics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.length === 0 ? (
          <p className="text-center text-gray-500">No topics added yet</p>
        ) : topics.map(topic => {
          const today = dayjs();
          const end = dayjs(topic.endDate);
          const isLate = end.isBefore(today) && topic.status !== 'completed';
          const topicProgress = topic.progress ?? (topic.status === 'completed' ? 100 : 0);

          return (
            <div key={topic._id} className={`card p-4 border ${topic.status === 'completed' ? 'bg-green-50' : 'bg-white'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {editingTopic === topic._id ? (
                    <input
                      type="text"
                      className="input w-full mb-1"
                      defaultValue={topic.name}
                      onBlur={e => handleUpdateTopic(topic._id, { ...topic, name: e.target.value })}
                      onKeyDown={e => { if (e.key === 'Enter') handleUpdateTopic(topic._id, { ...topic, name: e.target.value }); }}
                      autoFocus
                    />
                  ) : (
                    <h4 className={`font-bold ${topic.status === 'completed' ? 'line-through text-gray-500' : ''}`} onClick={() => setEditingTopic(topic._id)}>{topic.name}</h4>
                  )}
                  {topic.description && <p className="text-sm text-gray-600">{topic.description}</p>}
                  <div className="text-xs mt-1 flex gap-2">
                    <span>Start: {topic.startDate ? dayjs(topic.startDate).format('DD MMM') : '—'}</span>
                    <span>End: <span className={isLate ? 'text-red-600' : ''}>{topic.endDate ? dayjs(topic.endDate).format('DD MMM') : '—'}</span></span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div className="bg-blue-500 h-2 rounded" style={{ width: `${topicProgress}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-2">
                  <input type="checkbox" checked={topic.status === 'completed'} onChange={() => handleToggleTopic(topic._id)} className="h-5 w-5 cursor-pointer" />
                  <button className="text-red-600 text-sm" onClick={() => handleDeleteTopic(topic._id)}>Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
