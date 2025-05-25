import React, { useState } from 'react';
import Graph from './components/Graph';
import EmetricNavBar from './components/EmetricNavBar';
import './Emetric.css';

const EmetricProject: React.FC = () => {
  const [graphs, setGraphs] = useState<string[]>(['graph-1']);
  const [activeView, setActiveView] = useState<string>('dashboard');

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

  return (
    <div className="emetric-project-container">
      <div className="emetric-header">
        <h1>Emetric Project</h1>
      </div>
      
      <EmetricNavBar activeView={activeView} onViewChange={handleViewChange} />
      
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
            <Graph id={graphId} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmetricProject;
