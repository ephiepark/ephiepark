import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useProjects } from '../projects/ProjectsContext';

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProjectComponent } = useProjects();

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  const ProjectComponent = getProjectComponent(projectId);

  if (!ProjectComponent) {
    return <Navigate to="/projects" replace />;
  }

  return <ProjectComponent />;
};

export default ProjectPage;
