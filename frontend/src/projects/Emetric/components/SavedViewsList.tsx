import React, { useState, useEffect } from 'react';
import FirebaseApi from '../../../firebase/FirebaseApi';
import { Emetric_SavedView, Emetric_GraphModule, Emetric_TextBoxModule } from '../../../shared/types';
import './SavedViewsManager.css'; // Reuse existing styles

interface SavedViewsListProps {
  onLoadView: (view: Emetric_SavedView, navigateToDashboard?: boolean) => void;
}

const SavedViewsList: React.FC<SavedViewsListProps> = ({ onLoadView }) => {
  const [savedViews, setSavedViews] = useState<Emetric_SavedView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usernames, setUsernames] = useState<Record<string, string>>({});

  // Fetch saved views when component mounts
  useEffect(() => {
    fetchSavedViews();
  }, []);

  const fetchSavedViews = async () => {
    try {
      setLoading(true);
      const api = FirebaseApi.getInstance();
      const views = await api.getAllSavedEmetricViews();
      setSavedViews(views);
      
      // Fetch usernames for all unique user IDs
      const uniqueUserIds = Array.from(new Set(views.map(view => view.userId)));
      const usernamesMap: Record<string, string> = {};
      
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          const userData = await api.getUserData(userId);
          if (userData) {
            usernamesMap[userId] = userData.username;
          }
        })
      );
      
      setUsernames(usernamesMap);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching saved views:', err);
      setError('Failed to load saved views. Please try again later.');
      setLoading(false);
    }
  };

  const handleLoadView = (view: Emetric_SavedView) => {
    // When loading a view from the saved views list, navigate to dashboard
    onLoadView(view, true);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="saved-views-manager">
      <div className="saved-views-header">
        <h3>All Saved Views</h3>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-indicator">Loading saved views...</div>
      ) : savedViews.length === 0 ? (
        <div className="no-saved-views">
          <p>No saved views available.</p>
        </div>
      ) : (
        <div className="saved-views-list">
          {savedViews.map(view => (
            <div key={view.id} className="saved-view-item">
              <div className="saved-view-info">
                <h4>{view.name}</h4>
                <p className="saved-view-creator">
                  Created by: <strong>{usernames[view.userId] || 'Unknown user'}</strong>
                </p>
                <p className="saved-view-date">Saved on {formatDate(view.createdAt)}</p>
                <p className="saved-view-details">
                  {view.modules.filter(m => m.type === 'graph').length} graph{view.modules.filter(m => m.type === 'graph').length !== 1 ? 's' : ''} • 
                  {view.modules.filter(m => m.type === 'text-box').length} text box{view.modules.filter(m => m.type === 'text-box').length !== 1 ? 'es' : ''} • 
                  {view.modules.filter(m => m.type === 'graph').reduce((total, module) => {
                    const graphModule = module as Emetric_GraphModule;
                    return total + graphModule.selectedMetrics.length;
                  }, 0)} metric{view.modules.filter(m => m.type === 'graph').reduce((total, module) => {
                    const graphModule = module as Emetric_GraphModule;
                    return total + graphModule.selectedMetrics.length;
                  }, 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="saved-view-actions">
                <button 
                  className="load-view-button"
                  onClick={() => handleLoadView(view)}
                >
                  Load
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedViewsList;
