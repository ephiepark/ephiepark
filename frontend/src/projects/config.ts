import { ProjectsConfig } from '../types/project';
import EmetricProject from './emetric/EmetricProject';
import FredService from './emetric/services/fredService';
import FirebaseApi from '../firebase/FirebaseApi';

export const projectsConfig: ProjectsConfig = {
  emetric: {
    config: {
      name: 'Economic Metrics',
      description: 'Track and visualize key economic indicators from various sources including FRED and market sentiment analysis.',
      path: '/projects/emetric',
      status: 'development',
      version: '0.1.0',
      lastUpdated: '2025-02-23'
    },
    initialize: async () => {},
    Component: EmetricProject
  }
};
