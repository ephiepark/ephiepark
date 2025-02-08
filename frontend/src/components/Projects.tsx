import React from 'react';
import { useProjects } from '../projects/ProjectsContext';
import { Link } from 'react-router-dom';
import './Projects.css';

const Projects: React.FC = () => {
  const { projects } = useProjects();

  return (
    <div className="projects-container">
      <h1>Projects</h1>
      
      {projects.length === 0 ? (
        <p>No projects registered yet.</p>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <h2>{project.config.name}</h2>
              <p>{project.config.description}</p>
              <div className="project-card-meta">
                <span className={`status-badge status-${project.config.status}`}>
                  {project.config.status}
                </span>
                <span className="version">v{project.config.version}</span>
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
