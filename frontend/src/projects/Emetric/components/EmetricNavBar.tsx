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
          className="emetric-navbar-item disabled"
          disabled
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="emetric-navbar-icon">
            <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm2.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm4.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm4.5-6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
          </svg>
          Metrics Explorer
        </button>
        <button 
          className="emetric-navbar-item disabled"
          disabled
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="emetric-navbar-icon">
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3-7 3zm2-3.5l5-2.14 5 2.14V5H7v12.5z"/>
          </svg>
          Analysis
        </button>
        <button 
          className="emetric-navbar-item disabled"
          disabled
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="emetric-navbar-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          About
        </button>
      </div>
    </div>
  );
};

export default EmetricNavBar;
