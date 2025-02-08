import React from 'react';

export interface ProjectConfig {
  name: string;
  description: string;
  path: string;
  status: 'active' | 'inactive' | 'development';
  version: string;
  lastUpdated: string;
}

export interface ProjectMetrics {
  [key: string]: number | string | boolean;
}

export interface Project {
  id: string;
  config: ProjectConfig;
  metrics: ProjectMetrics;
}

export interface ProjectRegistration {
  config: ProjectConfig;
  initialize: () => Promise<void>;
  getMetrics: () => Promise<ProjectMetrics>;
  Component: React.ComponentType;
}
