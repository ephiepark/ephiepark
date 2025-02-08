import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project } from '../types/project';
import { projectRegistry } from './registry';

interface ProjectsContextType {
  projects: Project[];
  refreshProject: (id: string) => Promise<void>;
  getProjectComponent: (id: string) => React.ComponentType | undefined;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Initial load of all projects
    updateProjectsList();
  }, []);

  const updateProjectsList = () => {
    const allProjects = projectRegistry.getAllProjects();
    setProjects(allProjects);
  };

  const refreshProject = async (id: string) => {
    await projectRegistry.refreshProjectMetrics(id);
    updateProjectsList();
  };

  const getProjectComponent = (id: string) => {
    return projectRegistry.getProjectComponent(id);
  };

  const value = {
    projects,
    refreshProject,
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
