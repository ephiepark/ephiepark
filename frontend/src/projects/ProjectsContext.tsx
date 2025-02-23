import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project } from '../types/project';
import { projectRegistry } from './registry';

interface ProjectsContextType {
  projects: Project[];
  getProjectComponent: (id: string) => React.ComponentType | undefined;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState(() => projectRegistry.getAllProjects());

  useEffect(() => {
    const initializeProjects = async () => {
      await projectRegistry.initializeAllProjects();
      setProjects(projectRegistry.getAllProjects());
    };

    initializeProjects();
  }, []);

  const getProjectComponent = (id: string) => {
    return projectRegistry.getProjectComponent(id);
  };

  const value = {
    projects,
    getProjectComponent,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};
