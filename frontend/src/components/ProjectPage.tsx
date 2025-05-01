import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getProjectById } from '../projects/registry';

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  const project = getProjectById(projectId);

  if (project === null) {
    return <Navigate to="/projects" replace />;
  }

  return project.component;
};

export default ProjectPage;
