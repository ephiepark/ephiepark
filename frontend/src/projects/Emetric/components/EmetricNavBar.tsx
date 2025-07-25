import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

interface EmetricNavBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const EmetricNavBar: React.FC<EmetricNavBarProps> = ({ activeView, onViewChange }) => {
  const [searchParams] = useSearchParams();
  const viewId = searchParams.get('viewId');
  
  // Helper function to generate the URL with viewId if it exists
  const getTabUrl = (tab: string) => {
    return viewId ? `/projects/emetric/${tab}?viewId=${viewId}` : `/projects/emetric/${tab}`;
  };

  return (
    <div className="emetric-navbar">
      <div className="emetric-navbar-items">
        <Link 
          to={getTabUrl('dashboard')}
          className={`emetric-navbar-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onViewChange('dashboard');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="emetric-navbar-icon">
            <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm0 8h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm10 0h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm0-12h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1z"/>
          </svg>
          Dashboard
        </Link>
        <Link 
          to={getTabUrl('metrics-explorer')}
          className={`emetric-navbar-item ${activeView === 'metrics-explorer' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onViewChange('metrics-explorer');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="emetric-navbar-icon">
            <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm2.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm4.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm4.5-6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
          </svg>
          Metrics Explorer
        </Link>
        <Link 
          to={getTabUrl('saved-views')}
          className={`emetric-navbar-item ${activeView === 'saved-views' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onViewChange('saved-views');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="emetric-navbar-icon">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          </svg>
          Saved Views
        </Link>
      </div>
    </div>
  );
};

export default EmetricNavBar;
