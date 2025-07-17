// Shared type definitions for both frontend and functions

// Project types
export interface ProjectConfig {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'development';
  permission: 'all' | 'logged-in-user-only' | 'admin-only';
  // Note: component is frontend-specific and will be handled separately
}

// Blog types
export interface BlogPost {
  id: string;
  title: string;
  createdAt: number;
  content: string;
}

// Board types
export interface Comment {
  id: string;
  postId: string;
  content: string;
  createdAt: number;
  authorId: string;
  authorName: string;
}

export interface BoardPost {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  authorId: string;
  authorName: string;
  isHidden: boolean;
  commentCount: number;
}

// User types
export interface UserData {
  uid: string;
  username: string;
  isAdmin: boolean;
}

// Emetric Types
export const EMETRIC_TIMESERIES_COLLECTION = "emetric_timeseries";
export const EMETRIC_SAVED_VIEWS_COLLECTION = "emetric_saved_views";

export type Emetric_Metadata = {
  source?: string; // FRED, etc. 
};

export type Emetric_Metric = {
  id: string;
  name: string;
  description: string;
  updateCycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  unit: 'percent' | 'dollar' | 'billions of dollars' | 'number of days';
  metadata: Emetric_Metadata; // Optional additional data (e.g. revision, confidence interval)
};

export type Emetric_TimeSeriesEntry = {
  timestamp: number;
  value: number;
};

export type Emetric_TimeSeries = {
  id: string;
  entries: Array<Emetric_TimeSeriesEntry>;
};

// Formula would be string combination of +, -, /, *, (, ), {{timeseries_id}}
// For example, '{{fred_us_interest_payments_id}} / {{fred_us_federal_expenditures_id}}' 
// to calculate % of interest payment out of overall expenditure
export type Emetric_Derived_Timeseries_Definition = {
  id: string;
  metric: Emetric_Metric;
  alignmentStrategy: 'previous' | 'future' | 'nearest' | 'interpolate';
  formula: string;
};

// Type for TimeRange (imported from TimeRangeSelector)
export type TimeRangePreset = '1y' | '2y' | '5y' | '10y' | '20y' | 'max' | 'custom';

export interface TimeRange {
  startDate: Date | null;
  endDate: Date | null;
  preset: TimeRangePreset;
}

// Type for saved graph views
export interface Emetric_SavedView {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
  timeRange: TimeRange;
  graphs: Array<{
    id: string;
    selectedMetrics: string[];
  }>;
}
