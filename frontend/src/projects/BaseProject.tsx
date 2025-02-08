import React from 'react';
import { Project } from '../types/project';
import { useProjects } from './ProjectsContext';
import './BaseProject.css';

interface BaseProjectProps {
  id: string;
  children?: React.ReactNode;
}

export const BaseProject: React.FC<BaseProjectProps> = ({ id, children }) => {
  const { projects, refreshProject } = useProjects();
  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="project-error">
        <h2>Project Not Found</h2>
        <p>The project with ID "{id}" could not be found.</p>
      </div>
    );
  }

  return (
    <div className="project-container">
      <header className="project-header">
        <h1>{project.config.name}</h1>
        <div className="project-meta">
          <span className="project-version">v{project.config.version}</span>
          <span className={`project-status status-${project.config.status}`}>
            {project.config.status}
          </span>
        </div>
      </header>

      <div className="project-description">
        <p>{project.config.description}</p>
      </div>

      <div className="project-metrics">
        <h3>Metrics</h3>
        <button 
          onClick={() => refreshProject(id)}
          className="refresh-metrics-btn"
        >
          Refresh Metrics
        </button>
        <div className="metrics-grid">
          {Object.entries(project.metrics).map(([key, value]) => (
            <div key={key} className="metric-item">
              <label>{key}:</label>
              <span>{value.toString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="project-content">
        {children}
      </div>

      <footer className="project-footer">
        <p>Last updated: {new Date(project.config.lastUpdated).toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

export default BaseProject;
