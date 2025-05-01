import React from 'react';
import { projectRegistry } from '../projects/registry';
import { Link } from 'react-router-dom';
import './Projects.css';

const Projects: React.FC = () => {
  return (
    <div className="projects-container">
      <h1>Projects</h1>
      
      {projectRegistry.length === 0 ? (
        <p>No projects registered yet.</p>
      ) : (
        <div className="projects-grid">
          {projectRegistry.map(project => (
            <div key={project.id} className="project-card">
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <div className="project-card-meta">
                <span className={`status-badge status-${project.status}`}>
                  {project.status}
                </span>
              </div>
              <Link 
                to={`/projects/${project.id}`} 
                className="view-project-btn"
              >
                View Project
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
