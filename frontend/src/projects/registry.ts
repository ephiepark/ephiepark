import { ProjectConfig } from '../types/project';

export const getProjectById = (id: string): ProjectConfig | null => {
  const ret = projectRegistry.find(project => project.id === id);
  if (ret === null || ret === undefined) {
    return null;
  }
  return ret;
};

export const projectRegistry: Array<ProjectConfig> = [];
