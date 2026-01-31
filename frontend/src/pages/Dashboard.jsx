import { useState, useEffect } from 'react';
import api from '../services/api';
import dayjs from 'dayjs';

const Dashboard = () => {
  const [goal, setGoal] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Goal form state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', description: '' });

  // Topic form state
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicForm, setTopicForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  // Edit states
  const [editingGoal, setEditingGoal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [goalRes, topicsRes] = await Promise.all([api.get('/goal'), api.get('/topic')]);
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
      const res = await api.put('/goal', goalForm);
      setGoal(res.data.goal);
      setSuccess('Goal updated successfully');
      setEditingGoal(false); setShowGoalForm(false);
    } catch {
      setError('Failed to update goal');
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await api.post('/topic', { ...topicForm, goalId: goal._id });
      setTopics([res.data.topic, ...topics]);
      setTopicForm({ name: '', description: '', startDate: '', endDate: '' });
      setShowTopicForm(false);
      setSuccess('Topic added successfully');
    } catch {
      setError('Failed to add topic');
    }
  };

  const handleToggleTopic = async (topicId) => {
    try {
      const res = await api.put(`/topic/${topicId}/toggle`);
      setTopics(topics.map(t => t._id === topicId ? res.data.topic : t));
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

  const handleUpdateTopic = async (topicId, updated) => {
    try {
      const res = await api.put(`/topic/${topicId}`, updated);
      setTopics(topics.map(t => t._id === topicId ? res.data.topic : t));
      setEditingTopic(null);
    } catch {
      setError('Failed to update topic');
    }
  };

  // Statistics
  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.status === 'completed').length;
  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Alerts */}
      {error && <div className="mb-4 alert alert-error">{error}</div>}
      {success && <div className="mb-4 alert alert-success">{success}</div>}

      {/* Goal */}
      <div className="card mb-8 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Learning Goal</h2>
            {goal && <p className="text-gray-600 mt-2">{goal.title}</p>}
            {goal?.description && <p className="text-gray-500 mt-1">{goal.description}</p>}
          </div>
          <button
            onClick={() => { setEditingGoal(!editingGoal); setShowGoalForm(!showGoalForm); }}
            className="btn btn-secondary text-sm"
          >
            {editingGoal ? 'Cancel' : 'Edit Goal'}
          </button>
        </div>

        {showGoalForm && (
          <form onSubmit={handleUpdateGoal} className="space-y-4 pt-4 border-t">
            <input
              type="text" className="input" placeholder="Goal title"
              value={goalForm.title} onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
              required
            />
            <textarea
              className="input" rows={3} placeholder="Goal description"
              value={goalForm.description} onChange={e => setGoalForm({ ...goalForm, description: e.target.value })}
            />
            <button type="submit" className="btn btn-primary">Save Goal</button>
          </form>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="card text-center p-4"><div className="text-3xl font-bold text-blue-600">{totalTopics}</div><div>Total Topics</div></div>
        <div className="card text-center p-4"><div className="text-3xl font-bold text-green-600">{completedTopics}</div><div>Completed</div></div>
        <div className="card text-center p-4"><div className="text-3xl font-bold text-yellow-600">{totalTopics - completedTopics}</div><div>Pending</div></div>
        <div className="card text-center p-4"><div className="text-3xl font-bold text-purple-600">{progress}%</div><div>Progress</div></div>
      </div>

      {/* Add Topic */}
      <div className="card mb-6 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">My Topics</h3>
          <button className="btn btn-primary text-sm" onClick={() => setShowTopicForm(!showTopicForm)}>
            {showTopicForm ? 'Cancel' : '+ Add Topic'}
          </button>
        </div>
        {showTopicForm && (
          <form onSubmit={handleAddTopic} className="space-y-2">
            <input type="text" className="input" placeholder="Topic name"
              value={topicForm.name} onChange={e => setTopicForm({ ...topicForm, name: e.target.value })} required />
            <textarea className="input" rows={2} placeholder="Description"
              value={topicForm.description} onChange={e => setTopicForm({ ...topicForm, description: e.target.value })} />
            <div className="flex gap-2">
              <input type="date" className="input flex-1" value={topicForm.startDate} onChange={e => setTopicForm({ ...topicForm, startDate: e.target.value })} />
              <input type="date" className="input flex-1" value={topicForm.endDate} onChange={e => setTopicForm({ ...topicForm, endDate: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Add Topic</button>
          </form>
        )}
      </div>

      {/* Topics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.length === 0 ? (
          <p className="text-center text-gray-500">No topics added yet</p>
        ) : topics.map(topic => {
          const today = dayjs();
          const end = dayjs(topic.endDate);
          const isLate = end.isBefore(today) && topic.status !== 'completed';
          const topicProgress = topic.progress || (topic.status === 'completed' ? 100 : 0);
          return (
            <div key={topic._id} className={`card p-4 border ${topic.status === 'completed' ? 'bg-green-50' : 'bg-white'} relative`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-bold ${topic.status === 'completed' ? 'line-through text-gray-500' : ''}`}>{topic.name}</h4>
                  {topic.description && <p className="text-sm text-gray-600">{topic.description}</p>}
                  <div className="text-xs mt-1 flex gap-2">
                    <span>Start: {topic.startDate ? dayjs(topic.startDate).format('DD MMM') : '—'}</span>
                    <span>End: <span className={isLate ? 'text-red-600' : ''}>{topic.endDate ? dayjs(topic.endDate).format('DD MMM') : '—'}</span></span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div className="bg-blue-500 h-2 rounded" style={{ width: `${topicProgress}%` }}></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input type="checkbox" checked={topic.status === 'completed'} onChange={() => handleToggleTopic(topic._id)} className="h-5 w-5 cursor-pointer" />
                  <button onClick={() => setEditingTopic(topic._id)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDeleteTopic(topic._id)} className="text-red-600">Delete</button>
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
