import React from 'react';
import { ProjectConfig } from '../shared/types';
import EmetricProject from './Emetric/EmetricProject';

export const getProjectById = (id: string): ProjectConfig | null => {
  const ret = projectRegistry.find(project => project.id === id);
  if (ret === null || ret === undefined) {
    return null;
  }
  return ret;
};

export const projectRegistry: Array<ProjectConfig> = [
  {
    id: "emetric",
    name: "Emetric",
    description: "Economic metrics dashboard with data from various sources including FRED",
    status: "development",
    permission: "all",
  }
];

export const projectComponentRegistry: Record<string, React.FC> = {
  'emetric': EmetricProject, 
};
