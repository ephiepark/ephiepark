import React from 'react';
import { ProjectConfig as SharedProjectConfig } from '../../../shared/types';

// Extend the shared ProjectConfig with frontend-specific properties
export interface ProjectConfig extends SharedProjectConfig {
  component: JSX.Element;
}
