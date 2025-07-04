import React, { useState } from 'react';
import { useFirebase } from '../../firebase/FirebaseContext';
import LoginPrompt from '../../components/LoginPrompt';
import Graph from './components/Graph';
import EmetricNavBar from './components/EmetricNavBar';
import MetricExplorer from './components/MetricExplorer';
import TimeRangeSelector, { TimeRange } from './components/TimeRangeSelector';
import './Emetric.css';

const EmetricProject: React.FC = () => {
  const { user } = useFirebase();
  const [graphs, setGraphs] = useState<string[]>(['graph-1']);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startDate: null,
    endDate: new Date(),
    preset: 'max'
  });

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
  };

  const handleRemoveGraph = (graphIdToRemove: string) => {
    setGraphs(graphs.filter(graphId => graphId !== graphIdToRemove));
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'metrics-explorer':
        return <MetricExplorer />;
      case 'dashboard':
      default:
        return (
          <>
            <TimeRangeSelector 
              selectedRange={timeRange}
              onRangeChange={handleTimeRangeChange}
            />
            
            <div className="emetric-actions">
              <button className="add-graph-button" onClick={handleAddGraph}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Add Graph
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
                  <Graph id={graphId} timeRange={timeRange} />
                </div>
              ))}
            </div>
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
