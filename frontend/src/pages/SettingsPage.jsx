import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile state
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Goal state
  const [goalForm, setGoalForm] = useState({ title: '', description: '' });
  const [goalId, setGoalId] = useState(null); // store goal ID for updates

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchData = async () => {
    try {
      // Fetch profile
      const res = await api.get('/user/me');
      setProfileForm({ name: res.data.name, email: res.data.email });

      // Fetch goal
      const goalRes = await api.get('/goal');
      if (goalRes.data.goal) {
        setGoalId(goalRes.data.goal._id);
        setGoalForm({ title: goalRes.data.goal.title, description: goalRes.data.goal.description || '' });
      }
    } catch {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.put('/user/me', profileForm);
      setSuccess('Profile updated successfully');
    } catch {
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setError('New passwords do not match');
    }
    try {
      await api.put('/user/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully');
    } catch {
      setError('Failed to change password');
    }
  };

  const handleGoalUpdate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (goalId) {
        // Update existing goal
        const res = await api.put('/goal', goalForm);
        setGoalForm({ title: res.data.goal.title, description: res.data.goal.description || '' });
        setSuccess('Learning goal updated successfully');
      } else {
        // Create a new goal if none exists
        const res = await api.post('/goal', goalForm);
        setGoalId(res.data.goal._id);
        setGoalForm({ title: res.data.goal.title, description: res.data.goal.description || '' });
        setSuccess('Learning goal created successfully');
      }
    } catch {
      setError('Failed to update goal');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await api.delete('/user/me');
      logout();
    } catch {
      setError('Failed to delete account');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Profile Settings */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-3">
          <input
            type="text"
            className="input"
            placeholder="Name"
            value={profileForm.name}
            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
            required
            disabled
          />
          <input
            type="email"
            className="input"
            placeholder="Email"
            value={profileForm.email}
            onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
            required
            disabled
          />
        </form>
      </div>

      {/* Password Change */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <input
            type="password"
            className="input"
            placeholder="Current Password"
            value={passwordForm.currentPassword}
            onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            required
          />
          <input
            type="password"
            className="input"
            placeholder="New Password"
            value={passwordForm.newPassword}
            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            required
          />
          <input
            type="password"
            className="input"
            placeholder="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary">Change Password</button>
        </form>
      </div>

      {/* Learning Goal */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Learning Goal</h2>
        <form onSubmit={handleGoalUpdate} className="space-y-3">
          <input
            type="text"
            className="input"
            placeholder="Goal Title"
            value={goalForm.title}
            onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
            required
          />
          <textarea
            className="input"
            rows={3}
            placeholder="Goal Description"
            value={goalForm.description}
            onChange={e => setGoalForm({ ...goalForm, description: e.target.value })}
          />
          <button type="submit" className="btn btn-primary">
            {goalId ? 'Update Goal' : 'Create Goal'}
          </button>
        </form>
      </div>

      {/* Account Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Account</h2>
        <button onClick={handleDeleteAccount} className="btn btn-danger w-full">Delete Account</button>
      </div>
    </div>
  );
};

export default SettingsPage;
