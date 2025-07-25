import React from 'react';
import { ProjectConfig } from '../shared/types';
import EmetricProject from './Emetric/EmetricProject';
import TimelineProject from './Timeline/TimelineProject';

// Define interface for project components with initialTab prop
interface ProjectComponentProps {
  initialTab?: string;
}

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
    status: "active",
    permission: "all",
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Visualize events and milestones on an interactive timeline",
    status: "development",
    permission: "all",
  }
];

export const projectComponentRegistry: Record<string, React.FC<ProjectComponentProps>> = {
  'emetric': EmetricProject,
  'timeline': TimelineProject,
};
