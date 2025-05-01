import React, { useState, useEffect } from 'react';
import MetricsList from './MetricsList';
import TimeSeriesChart from './TimeSeriesChart';
import FirebaseApi from '../../../firebase/FirebaseApi';
import {Emetric_Metric, Emetric_TimeSeries} from '../../../shared/types';
import { metricRegistry } from '../../../shared/emetric/metricRegistry';

// Define types locally to avoid import issues
interface GraphProps {
  id: string;
}

const Graph: React.FC<GraphProps> = ({ id }) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<Record<string, Emetric_TimeSeries | null>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const metrics = metricRegistry;

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
      if (prev.includes(metricId)) {
        return prev.filter(id => id !== metricId);
      } else {
        return [...prev, metricId];
      }
    });
  };

  return (
    <div className="graph-container">
      {error && <div className="error-message">{error}</div>}
      
      <div className="graph-content">
        <div className="chart-area">
          {loading && selectedMetrics.length > 0 ? (
            <div className="loading-indicator">Loading data...</div>
          ) : (
            <TimeSeriesChart 
              timeSeriesData={timeSeriesData}
              metrics={metrics}
              selectedMetrics={selectedMetrics}
            />
          )}
        </div>
        
        <div className="metrics-area">
          {loading && metrics.length === 0 ? (
            <div className="loading-indicator">Loading metrics...</div>
          ) : (
            <MetricsList 
              metrics={metrics}
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
