import React from 'react';

export interface ProjectConfig {
  name: string;
  description: string;
  path: string;
  status: 'active' | 'inactive' | 'development';
  version: string;
  lastUpdated: string;
}

export interface Project {
  id: string;
  config: ProjectConfig;
  initializationStatus: 'pending' | 'completed';
}

export interface StaticProjectConfig {
  config: ProjectConfig;
  initialize: () => Promise<void>;
  Component: React.ComponentType;
}

export interface ProjectsConfig {
  [id: string]: StaticProjectConfig;
}
