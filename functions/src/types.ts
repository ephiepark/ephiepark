export interface Metric {
  id: string;
  name: string;
  description: string;
  category: string;
  sourceId: string;
  sourceKey: string;
  frequency: string;
  unit: string;
  displayConfig: {
    showChange: boolean;
  };
}

export interface MetricData {
  metricId: string;
  timestamp: number;
  value: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  config: {
    apiKey: string;
    baseUrl: string;
  };
  enabled: boolean;
}

export interface UserPreferences {
  favoriteMetrics?: string[];
  defaultTimeRange?: string;
  notifications?: boolean;
}
