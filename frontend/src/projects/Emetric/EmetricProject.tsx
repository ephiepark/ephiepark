import React, { useState, useRef, useEffect } from 'react';
import { useFirebase } from '../../firebase/FirebaseContext';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import FirebaseApi from '../../firebase/FirebaseApi';
import LoginPrompt from '../../components/LoginPrompt';
import Graph from './components/Graph';
import EmetricNavBar from './components/EmetricNavBar';
import MetricExplorer from './components/MetricExplorer';
import SavedViewsManager from './components/SavedViewsManager';
import SavedViewsList from './components/SavedViewsList';
import TimeRangeSelector, { TimeRange } from './components/TimeRangeSelector';
import { Emetric_SavedView } from '../../shared/types';
import './Emetric.css';
import './components/SavedViewsManager.css';

interface EmetricProjectProps {
  initialTab?: string;
}

const EmetricProject: React.FC<EmetricProjectProps> = ({ initialTab }) => {
  const { user } = useFirebase();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [graphs, setGraphs] = useState<string[]>(['graph-1']);
  const [activeView, setActiveView] = useState<string>(initialTab || 'dashboard');
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startDate: null,
    endDate: new Date(),
    preset: 'max'
  });
  const [showSavedViews, setShowSavedViews] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentlyLoadedView, setCurrentlyLoadedView] = useState<Emetric_SavedView | undefined>(undefined);
  const [updateInProgress, setUpdateInProgress] = useState<boolean>(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState<boolean>(false);
  const [viewName, setViewName] = useState<string>('');
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store selected metrics for each graph
  const selectedMetricsRef = useRef<Record<string, string[]>>({
    'graph-1': []
  });

  // Effect to sync the URL with the active view when initialTab changes
  useEffect(() => {
    if (initialTab && initialTab !== activeView) {
      setActiveView(initialTab);
    }
  }, [initialTab]);

  // Effect to handle initial navigation
  useEffect(() => {
    // If we're at /projects/emetric without a tab, redirect to /projects/emetric/dashboard
    if (!initialTab && user) {
      const viewId = searchParams.get('viewId');
      if (viewId) {
        navigate(`/projects/emetric/dashboard?viewId=${viewId}`);
      } else {
        navigate('/projects/emetric/dashboard');
      }
    }
  }, [initialTab, user, navigate, searchParams]);

  // Load view from URL parameter when component mounts
  useEffect(() => {
    const loadViewFromUrl = async () => {
      const viewId = searchParams.get('viewId');
      if (viewId && user) {
        try {
          setIsLoading(true);
          const api = FirebaseApi.getInstance();
          const view = await api.getSavedEmetricView(viewId);
          if (view) {
            handleLoadSavedView(view, false, false); // Load view without updating URL or navigating
          }
        } catch (error) {
          console.error('Error loading view from URL:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadViewFromUrl();
  }, [searchParams, user]);

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="emetric-project-container">
        <div className="emetric-header">
          <h1>Emetric Project</h1>
        </div>
        <LoginPrompt 
          title="Emetric Dashboard Access" 
          message="Please log in to access the Emetric dashboard and view economic metrics."
          className="emetric-login-prompt"
        />
      </div>
    );
  }

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
  };

  const handleAddGraph = () => {
    const newGraphId = `graph-${graphs.length + 1}`;
    setGraphs([...graphs, newGraphId]);
    // Initialize empty selected metrics for the new graph
    selectedMetricsRef.current[newGraphId] = [];
  };

  const handleRemoveGraph = (graphIdToRemove: string) => {
    setGraphs(graphs.filter(graphId => graphId !== graphIdToRemove));
    // Clean up selected metrics for the removed graph
    const updatedMetrics = { ...selectedMetricsRef.current };
    delete updatedMetrics[graphIdToRemove];
    selectedMetricsRef.current = updatedMetrics;
  };

  const handleMoveGraphUp = (graphIdToMove: string) => {
    const index = graphs.indexOf(graphIdToMove);
    if (index > 0) {
      const newGraphs = [...graphs];
      [newGraphs[index], newGraphs[index - 1]] = [newGraphs[index - 1], newGraphs[index]];
      setGraphs(newGraphs);
    }
  };

  const handleMoveGraphDown = (graphIdToMove: string) => {
    const index = graphs.indexOf(graphIdToMove);
    if (index < graphs.length - 1) {
      const newGraphs = [...graphs];
      [newGraphs[index], newGraphs[index + 1]] = [newGraphs[index + 1], newGraphs[index]];
      setGraphs(newGraphs);
    }
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    
    // Update URL to reflect the current view
    const viewId = searchParams.get('viewId');
    
    // Only preserve the viewId parameter for dashboard view
    if (viewId && view === 'dashboard') {
      navigate(`/projects/emetric/${view}?viewId=${viewId}`);
    } else {
      navigate(`/projects/emetric/${view}`);
    }
  };

  const handleMetricsChange = (graphId: string, metrics: string[]) => {
    // Update the selected metrics for the graph
    selectedMetricsRef.current[graphId] = metrics;
  };

  const getSelectedMetricsForGraph = (graphId: string): string[] => {
    return selectedMetricsRef.current[graphId] || [];
  };

  const handleUpdateView = async () => {
    if (!currentlyLoadedView) {
      setError('No view is currently loaded');
      return;
    }

    try {
      setUpdateInProgress(true);
      
      // Create a view object with the current state but keep the original ID, name, and userId
      const graphsData = graphs.map(graphId => ({
        id: graphId,
        selectedMetrics: getSelectedMetricsForGraph(graphId)
      }));

      const updatedView: Emetric_SavedView = {
        ...currentlyLoadedView,
        timeRange,
        graphs: graphsData
      };

      const api = FirebaseApi.getInstance();
      await api.saveEmetricView(updatedView);
      
      setUpdateInProgress(false);
      setError(null);
    } catch (err) {
      console.error('Error updating view:', err);
      setError('Failed to update view. Please try again later.');
      setUpdateInProgress(false);
    }
  };

  const handleSaveViewAs = async () => {
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
      
      // Reset the form
      setViewName('');
      setShowSaveAsModal(false);
      setSaveInProgress(false);
    } catch (err) {
      console.error('Error saving view:', err);
      setError('Failed to save view. Please try again later.');
      setSaveInProgress(false);
    }
  };

  const handleLoadSavedView = (view: Emetric_SavedView, navigateToDashboard: boolean = false, updateUrl: boolean = true) => {
    // Update time range
    setTimeRange(view.timeRange);
    
    // Update graphs and their selected metrics
    const newGraphs = view.graphs.map(graph => graph.id);
    setGraphs(newGraphs);
    
    // Update selected metrics for each graph
    const newSelectedMetrics: Record<string, string[]> = {};
    view.graphs.forEach(graph => {
      newSelectedMetrics[graph.id] = graph.selectedMetrics;
    });
    selectedMetricsRef.current = newSelectedMetrics;
    
    // Hide saved views panel after loading
    setShowSavedViews(false);

    // Set the currently loaded view
    setCurrentlyLoadedView(view);

    // If navigateToDashboard is true, change the active view to dashboard
    if (navigateToDashboard) {
      setActiveView('dashboard');
    }

    // Update URL with viewId parameter
    if (updateUrl) {
      // If navigating to dashboard or already on dashboard, include viewId
      if (navigateToDashboard || activeView === 'dashboard') {
        navigate(`/projects/emetric/dashboard?viewId=${view.id}`);
      } else {
        // For other views, don't include viewId parameter
        navigate(`/projects/emetric/${activeView}`);
      }
    }
  };

  const toggleSavedViews = () => {
    setShowSavedViews(!showSavedViews);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'metrics-explorer':
        return <MetricExplorer />;
      case 'saved-views':
        return <SavedViewsList onLoadView={handleLoadSavedView} />;
      case 'dashboard':
      default:
        return (
          <>
            {isLoading ? (
              <div className="loading-indicator">Loading saved view...</div>
            ) : (
              <>
                {currentlyLoadedView && (
                  <div className="loaded-view-display">
                    <h3>Current View: <span className="loaded-view-name">{currentlyLoadedView.name}</span></h3>
                    <div className="loaded-view-actions">
                      <button 
                        className="update-view-button"
                        onClick={handleUpdateView}
                        disabled={updateInProgress}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"/>
                        </svg>
                        Update View
                      </button>
                      <button 
                        className="save-as-view-button"
                        onClick={() => setShowSaveAsModal(true)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM6 6h9v4H6z"/>
                        </svg>
                        Save Current View As
                      </button>
                    </div>
                  </div>
                )}
                
                {error && <div className="error-message">{error}</div>}
                
                <TimeRangeSelector 
                  selectedRange={timeRange}
                  onRangeChange={handleTimeRangeChange}
                />
                
                {showSavedViews && (
                  <SavedViewsManager
                    graphs={graphs}
                    getSelectedMetricsForGraph={getSelectedMetricsForGraph}
                    timeRange={timeRange}
                    onLoadView={handleLoadSavedView}
                    currentlyLoadedView={currentlyLoadedView}
                  />
                )}
                
                <div className="emetric-actions">
                  <button className="add-graph-button" onClick={handleAddGraph}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Add Graph
                  </button>
                  
                  <button className="saved-views-button" onClick={toggleSavedViews}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                    </svg>
                    {showSavedViews ? 'Hide Saved Views' : 'Show Saved Views'}
                  </button>
                </div>
                
                <div className="graphs-container">
                  {graphs.map(graphId => (
                    <div key={graphId} className="graph-wrapper">
                      <div className="graph-header">
                        <div className="graph-controls">
                          <button 
                            className="move-graph-up-button" 
                            onClick={() => handleMoveGraphUp(graphId)}
                            disabled={graphs.indexOf(graphId) === 0}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7 14l5-5 5 5z"/>
                            </svg>
                            Move Up
                          </button>
                          <button 
                            className="move-graph-down-button" 
                            onClick={() => handleMoveGraphDown(graphId)}
                            disabled={graphs.indexOf(graphId) === graphs.length - 1}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7 10l5 5 5-5z"/>
                            </svg>
                            Move Down
                          </button>
                          <button 
                            className="remove-graph-button" 
                            onClick={() => handleRemoveGraph(graphId)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                      <Graph 
                        id={graphId} 
                        timeRange={timeRange} 
                        initialSelectedMetrics={getSelectedMetricsForGraph(graphId)}
                        onMetricsChange={handleMetricsChange}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        );
    }
  };

  // Save As Modal
  const renderSaveAsModal = () => {
    if (!showSaveAsModal) return null;
    
    return (
      <div className="modal-overlay">
        <div className="save-view-modal">
          <div className="modal-header">
            <h3>Save Current View As</h3>
            <button 
              className="close-modal-button"
              onClick={() => setShowSaveAsModal(false)}
              disabled={saveInProgress}
            >
              ×
            </button>
          </div>
          <div className="modal-content">
            <div className="form-group">
              <label htmlFor="view-name-as">View Name</label>
              <input
                type="text"
                id="view-name-as"
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
              onClick={() => setShowSaveAsModal(false)}
              disabled={saveInProgress}
            >
              Cancel
            </button>
            <button 
              className="save-button"
              onClick={handleSaveViewAs}
              disabled={!viewName.trim() || saveInProgress}
            >
              {saveInProgress ? 'Saving...' : 'Save View'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="emetric-project-container">
      <div className="emetric-header">
        <h1>Emetric Project</h1>
      </div>
      
      <EmetricNavBar activeView={activeView} onViewChange={handleViewChange} />
      
      {renderContent()}
      {renderSaveAsModal()}
    </div>
  );
};

export default EmetricProject;
