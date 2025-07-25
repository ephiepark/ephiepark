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
            handleLoadSavedView(view, false); // Load view without updating URL
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

  const handleLoadSavedView = (view: Emetric_SavedView, updateUrl: boolean = true) => {
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

    // Update URL with viewId parameter only for dashboard view
    if (updateUrl) {
      if (activeView === 'dashboard') {
        // Only include viewId parameter for dashboard view
        navigate(`/projects/emetric/${activeView}?viewId=${view.id}`);
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
                  </div>
                )}
                
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

  return (
    <div className="emetric-project-container">
      <div className="emetric-header">
        <h1>Emetric Project</h1>
      </div>
      
      <EmetricNavBar activeView={activeView} onViewChange={handleViewChange} />
      
      {renderContent()}
    </div>
  );
};

export default EmetricProject;
