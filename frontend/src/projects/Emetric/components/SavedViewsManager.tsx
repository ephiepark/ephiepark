import React, { useState, useEffect } from 'react';
import FirebaseApi from '../../../firebase/FirebaseApi';
import { Emetric_SavedView, TimeRange } from '../../../shared/types';

interface SavedViewsManagerProps {
  graphs: string[];
  getSelectedMetricsForGraph: (graphId: string) => string[];
  timeRange: TimeRange;
  onLoadView: (view: Emetric_SavedView) => void;
}

const SavedViewsManager: React.FC<SavedViewsManagerProps> = ({
  graphs,
  getSelectedMetricsForGraph,
  timeRange,
  onLoadView
}) => {
  const [savedViews, setSavedViews] = useState<Emetric_SavedView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [viewName, setViewName] = useState<string>('');
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  const [deleteInProgress, setDeleteInProgress] = useState<boolean>(false);

  // Fetch saved views when component mounts
  useEffect(() => {
    fetchSavedViews();
  }, []);

  const fetchSavedViews = async () => {
    try {
      setLoading(true);
      const api = FirebaseApi.getInstance();
      const views = await api.getSavedEmetricViews();
      setSavedViews(views);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching saved views:', err);
      setError('Failed to load saved views. Please try again later.');
      setLoading(false);
    }
  };

  const handleSaveView = async () => {
    if (!viewName.trim()) {
      setError('Please enter a name for this view');
      return;
    }

    try {
      setSaveInProgress(true);
      
      // Create a view object with the current state
      const graphsData = graphs.map(graphId => ({
        id: graphId,
        selectedMetrics: getSelectedMetricsForGraph(graphId)
      }));

      const view: Emetric_SavedView = {
        id: '', // Will be set by the API
        name: viewName.trim(),
        userId: '', // Will be set by the API
        createdAt: Date.now(),
        timeRange,
        graphs: graphsData
      };

      const api = FirebaseApi.getInstance();
      await api.saveEmetricView(view);
      
      // Refresh the list of saved views
      await fetchSavedViews();
      
      // Reset the form
      setViewName('');
      setShowSaveModal(false);
      setSaveInProgress(false);
    } catch (err) {
      console.error('Error saving view:', err);
      setError('Failed to save view. Please try again later.');
      setSaveInProgress(false);
    }
  };

  const handleDeleteView = async (viewId: string) => {
    if (window.confirm('Are you sure you want to delete this saved view?')) {
      try {
        setDeleteInProgress(true);
        const api = FirebaseApi.getInstance();
        await api.deleteSavedEmetricView(viewId);
        
        // Refresh the list of saved views
        await fetchSavedViews();
        setDeleteInProgress(false);
      } catch (err) {
        console.error('Error deleting view:', err);
        setError('Failed to delete view. Please try again later.');
        setDeleteInProgress(false);
      }
    }
  };

  const handleLoadView = (view: Emetric_SavedView) => {
    onLoadView(view);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="saved-views-manager">
      <div className="saved-views-header">
        <h3>Saved Views</h3>
        <button 
          className="save-view-button"
          onClick={() => setShowSaveModal(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          Save Current View
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-indicator">Loading saved views...</div>
      ) : savedViews.length === 0 ? (
        <div className="no-saved-views">
          <p>You don't have any saved views yet.</p>
        </div>
      ) : (
        <div className="saved-views-list">
          {savedViews.map(view => (
            <div key={view.id} className="saved-view-item">
              <div className="saved-view-info">
                <h4>{view.name}</h4>
                <p className="saved-view-date">Saved on {formatDate(view.createdAt)}</p>
                <p className="saved-view-details">
                  {view.graphs.length} graph{view.graphs.length !== 1 ? 's' : ''} • 
                  {view.graphs.reduce((total, graph) => total + graph.selectedMetrics.length, 0)} metric{view.graphs.reduce((total, graph) => total + graph.selectedMetrics.length, 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="saved-view-actions">
                <button 
                  className="load-view-button"
                  onClick={() => handleLoadView(view)}
                  disabled={deleteInProgress}
                >
                  Load
                </button>
                <button 
                  className="delete-view-button"
                  onClick={() => handleDeleteView(view.id)}
                  disabled={deleteInProgress}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSaveModal && (
        <div className="modal-overlay">
          <div className="save-view-modal">
            <div className="modal-header">
              <h3>Save Current View</h3>
              <button 
                className="close-modal-button"
                onClick={() => setShowSaveModal(false)}
                disabled={saveInProgress}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="view-name">View Name</label>
                <input
                  type="text"
                  id="view-name"
                  className="form-control"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  placeholder="Enter a name for this view"
                  disabled={saveInProgress}
                />
              </div>
              <div className="view-summary">
                <p>This view contains:</p>
                <ul>
                  <li>{graphs.length} graph{graphs.length !== 1 ? 's' : ''}</li>
                  <li>
                    {graphs.reduce((total, graphId) => {
                      const metrics = getSelectedMetricsForGraph(graphId);
                      return total + metrics.length;
                    }, 0)} selected metric{graphs.reduce((total, graphId) => {
                      const metrics = getSelectedMetricsForGraph(graphId);
                      return total + metrics.length;
                    }, 0) !== 1 ? 's' : ''}
                  </li>
                  <li>Time range: {timeRange.preset}</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowSaveModal(false)}
                disabled={saveInProgress}
              >
                Cancel
              </button>
              <button 
                className="save-button"
                onClick={handleSaveView}
                disabled={!viewName.trim() || saveInProgress}
              >
                {saveInProgress ? 'Saving...' : 'Save View'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedViewsManager;
