import { useEffect, useState } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const StatisticsPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await api.get('/topic');
      setTopics(res.data.topics);
    } catch {
      setError('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.status === 'completed').length;
  const pendingTopics = topics.filter(t => t.status === 'pending').length;
  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const pieData = [
    { name: 'Completed', value: completedTopics },
    { name: 'Pending', value: pendingTopics }
  ];
  const COLORS = ['#22c55e', '#facc15'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Statistics</h1>
      {/* Progress Bar */}
      <div className="card p-4 mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full">
          <div
            className="h-4 rounded-full bg-purple-600"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="card p-4 mb-8">
        <h2 className="text-xl font-bold mb-4">Topic Completion</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Topics */}
      <div className="card p-4">
        <h2 className="text-xl font-bold mb-4">Recent Topics</h2>
        {topics.length === 0 ? (
          <p className="text-gray-500">No topics added yet.</p>
        ) : (
          <ul className="space-y-2">
            {topics.slice(0, 5).map((topic) => (
              <li
                key={topic._id}
                className="flex justify-between p-3 border rounded-lg bg-white"
              >
                <span className={`${topic.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                  {topic.name}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    topic.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {topic.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;
