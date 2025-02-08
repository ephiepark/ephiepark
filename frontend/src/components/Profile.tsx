import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FirebaseApi from '../firebase/FirebaseApi';
import { UserData } from '../types/user';
import './Profile.css';

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const api = FirebaseApi.getInstance();
  const currentUser = api.getCurrentUser();

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        navigate('/');
        return;
      }

      try {
        const data = await api.getUserData(currentUser.uid);
        if (data) {
          setUserData(data);
          setUsername(data.username);
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, navigate, api]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await api.updateUsername(currentUser.uid, username);
      setUserData(prev => prev ? { ...prev, username } : null);
      setError(null);
    } catch (err) {
      setError('Failed to update username');
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (!currentUser || !userData) {
    return <div className="profile-container">Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Username</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="profile-info">
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p><strong>Admin Status:</strong> {userData.isAdmin ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default Profile;
