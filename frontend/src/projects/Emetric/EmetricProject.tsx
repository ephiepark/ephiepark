import React, { useState } from 'react';
import Graph from './components/Graph';
import './Emetric.css';

const EmetricProject: React.FC = () => {
  const [graphs, setGraphs] = useState<string[]>(['graph-1']);

  const handleAddGraph = () => {
    const newGraphId = `graph-${graphs.length + 1}`;
    setGraphs([...graphs, newGraphId]);
  };

  return (
    <div className="emetric-project-container">
      <div className="emetric-header">
        <h1>Emetric Project</h1>
        <button className="add-graph-button" onClick={handleAddGraph}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Graph
        </button>
      </div>
      
      <div className="graphs-container">
        {graphs.map(graphId => (
          <Graph key={graphId} id={graphId} />
        ))}
      </div>
    </div>
  );
};

export default EmetricProject;
