import React from 'react';

interface EmetricNavBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const EmetricNavBar: React.FC<EmetricNavBarProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="emetric-navbar">
      <div className="emetric-navbar-items">
        <button 
          className={`emetric-navbar-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="emetric-navbar-icon">
            <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm0 8h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm10 0h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm0-12h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1z"/>
          </svg>
          Dashboard
        </button>
        <button 
          className={`emetric-navbar-item ${activeView === 'metrics-explorer' ? 'active' : ''}`}
          onClick={() => onViewChange('metrics-explorer')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="emetric-navbar-icon">
            <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm2.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm4.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm4.5-6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
          </svg>
          Metrics Explorer
        </button>
      </div>
    </div>
  );
};

export default EmetricNavBar;
