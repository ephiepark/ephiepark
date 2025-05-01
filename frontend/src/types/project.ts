import React from 'react';

export interface ProjectConfig {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'development';
  permission: 'all' | 'logged-in-user-only' | 'admin-only';
  component: JSX.Element,
}

