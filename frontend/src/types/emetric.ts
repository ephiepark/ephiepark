export interface DataSource {
  id: string;
  name: string;
  type: 'fred' | 'reddit' | string;
  config: Record<string, any>;
  enabled: boolean;
  lastSync?: number;
}

export interface Metric {
  id: string;
  name: string;
  description: string;
  sourceId: string;
  sourceKey: string;
  category: string;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  displayConfig: {
    chartType: 'line' | 'bar' | 'area';
    color?: string;
    showChange?: boolean;
    compareWith?: string[];
  };
}

export interface MetricData {
  metricId: string;
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

export interface MetricCategory {
  id: string;
  name: string;
  description: string;
  color?: string;
}

export interface UserPreferences {
  userId: string;
  dashboardLayout: {
    metrics: string[];
    layout: {
      i: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }[];
  };
  favorites: string[];
  alerts: {
    metricId: string;
    condition: 'above' | 'below' | 'change';
    value: number;
    enabled: boolean;
  }[];
}
