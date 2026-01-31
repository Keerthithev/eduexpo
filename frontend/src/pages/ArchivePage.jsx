import { useEffect, useState } from 'react';
import api from '../services/api';

const ArchivePage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchArchivedTopics();
  }, []);

  const fetchArchivedTopics = async () => {
    try {
      const res = await api.get('/topic');
      // Only archived/completed topics
      const archived = res.data.topics.filter(t => t.status === 'completed');
      setTopics(archived);
    } catch {
      setError('Failed to load archived topics');
    } finally {
      setLoading(false);
    }
  };

  // Filter topics by search
  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(search.toLowerCase())
  );

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

      <h1 className="text-2xl font-bold mb-4">Archive</h1>
      <p className="text-gray-600 mb-4">View completed or archived topics here.</p>

      {/* Search */}
      <input
        type="text"
        placeholder="Search archived topics..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input w-full mb-6"
      />

      {/* Archived Topics List */}
      {filteredTopics.length === 0 ? (
        <p className="text-gray-500">No archived topics found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredTopics.map((topic) => (
            <div
              key={topic._id}
              className="p-4 rounded-lg border bg-green-50 border-green-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{topic.name}</h3>
                {topic.description && (
                  <p className="text-gray-600 mt-1 text-sm">{topic.description}</p>
                )}
              </div>
              <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                <span>Completed on: {new Date(topic.updatedAt).toLocaleDateString()}</span>
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-[10px]">
                  Completed
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivePage;
