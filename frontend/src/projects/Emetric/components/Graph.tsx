import React, { useState, useEffect } from 'react';
import MetricsList from './MetricsList';
import TimeSeriesChart from './TimeSeriesChart';
import FirebaseApi from '../../../firebase/FirebaseApi';
import {Emetric_Metric, Emetric_TimeSeries, Emetric_Derived_Timeseries_Definition} from '../../../shared/types';
import { metricRegistry } from '../../../shared/emetric/metricRegistry';
import { TimeRange } from './TimeRangeSelector';

// Define types locally to avoid import issues
interface GraphProps {
  id: string;
  timeRange?: TimeRange;
  initialSelectedMetrics?: string[];
  onMetricsChange?: (graphId: string, metrics: string[]) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onRemove?: (id: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const Graph: React.FC<GraphProps> = ({ 
  id, 
  timeRange, 
  initialSelectedMetrics = [], 
  onMetricsChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  isFirst = false,
  isLast = false
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(initialSelectedMetrics);
  const [timeSeriesData, setTimeSeriesData] = useState<Record<string, Emetric_TimeSeries | null>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [derivedMetrics, setDerivedMetrics] = useState<Emetric_Metric[]>([]);
  const [allMetrics, setAllMetrics] = useState<Emetric_Metric[]>(metricRegistry);

  // Fetch derived time series definitions when component mounts
  useEffect(() => {
    const fetchDerivedTimeSeriesDefinitions = async () => {
      try {
        const api = FirebaseApi.getInstance();
        const definitions = await api.getDerivedTimeSeriesDefinitions();
        
        // Extract metrics from definitions
        const derivedMetricsFromDefinitions = definitions.map(def => def.metric);
        setDerivedMetrics(derivedMetricsFromDefinitions);
        
        // Combine regular metrics with derived metrics
        setAllMetrics([...metricRegistry, ...derivedMetricsFromDefinitions]);
      } catch (err) {
        console.error('Error fetching derived time series definitions:', err);
        setError('Failed to load derived time series definitions. Please try again later.');
      }
    };

    fetchDerivedTimeSeriesDefinitions();
  }, []);

  // Fetch time series data when selected metrics change
  useEffect(() => {
    const fetchTimeSeriesData = async () => {
      if (selectedMetrics.length === 0) return;

      try {
        setLoading(true);
        const api = FirebaseApi.getInstance();
        
        // Fetch time series data for each selected metric
        const promises = selectedMetrics.map(async (metricId) => {
          // Skip if we already have data for this metric
          if (timeSeriesData[metricId]) return;
          
          const data = await api.getEmetricTimeSeries(metricId);
          return { metricId, data };
        });

        const results = await Promise.all(promises);
        
        // Update time series data state
        const newData = { ...timeSeriesData };
        results.forEach(result => {
          if (result) {
            newData[result.metricId] = result.data;
          }
        });

        setTimeSeriesData(newData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching time series data:', err);
        setError('Failed to load time series data. Please try again later.');
        setLoading(false);
      }
    };

    fetchTimeSeriesData();
  }, [selectedMetrics]);

  // Handle metric selection/deselection
  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => {
      const newMetrics = prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId];
      
      // Notify parent component if callback is provided
      if (onMetricsChange) {
        onMetricsChange(id, newMetrics);
      }
      
      return newMetrics;
    });
  };

  // Update selected metrics when initialSelectedMetrics prop changes
  useEffect(() => {
    if (initialSelectedMetrics && initialSelectedMetrics.length > 0) {
      setSelectedMetrics(initialSelectedMetrics);
    }
  }, [initialSelectedMetrics]);

  return (
    <div className="module graph-module">
      <div className="module-header">
        <div className="module-controls">
          {onMoveUp && (
            <button 
              className="move-up-button" 
              onClick={() => onMoveUp(id)}
              disabled={isFirst}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14l5-5 5 5z"/>
              </svg>
              Move Up
            </button>
          )}
          {onMoveDown && (
            <button 
              className="move-down-button" 
              onClick={() => onMoveDown(id)}
              disabled={isLast}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
              Move Down
            </button>
          )}
          {onRemove && (
            <button 
              className="remove-button" 
              onClick={() => onRemove(id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              Remove
            </button>
          )}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      
      <div className="graph-content">
        <div className="chart-area">
          {loading && selectedMetrics.length > 0 ? (
            <div className="loading-indicator">Loading data...</div>
          ) : (
            <TimeSeriesChart 
              timeSeriesData={timeSeriesData}
              metrics={allMetrics}
              selectedMetrics={selectedMetrics}
              timeRange={timeRange}
            />
          )}
        </div>
        
        <div className="metrics-area">
          {loading && allMetrics.length === 0 ? (
            <div className="loading-indicator">Loading metrics...</div>
          ) : (
            <MetricsList 
              metrics={allMetrics}
              selectedMetrics={selectedMetrics}
              onMetricToggle={handleMetricToggle}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Graph;
