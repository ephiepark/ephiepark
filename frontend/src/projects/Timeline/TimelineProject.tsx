import React from 'react';
import './Timeline.css';

const TimelineProject: React.FC = () => {
  return (
    <div className="timeline-project-container">
      <div className="timeline-header">
        <h1>Timeline Project</h1>
      </div>
      
      <div className="timeline-content">
        <div className="timeline-placeholder">
          <h2>Coming Soon</h2>
          <p>The Timeline project is currently under development. Check back later for updates!</p>
        </div>
      </div>
    </div>
  );
};

export default TimelineProject;
