import React from 'react';
import {Emetric_Metric} from '../../../shared/types';

// Define types locally to avoid import issues
interface MetricsListProps {
  metrics: Emetric_Metric[];
  selectedMetrics: string[];
  onMetricToggle: (metricId: string) => void;
}

const MetricsList: React.FC<MetricsListProps> = ({ 
  metrics, 
  selectedMetrics, 
  onMetricToggle 
}) => {
  return (
    <div className="metrics-list">
      <h3>Available Metrics</h3>
      {metrics.length === 0 ? (
        <p>No metrics available</p>
      ) : (
        <ul className="metrics-list-items">
          {metrics.map(metric => (
            <li key={metric.id} className="metric-item">
              <label className="metric-label">
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric.id)}
                  onChange={() => onMetricToggle(metric.id)}
                  className="metric-checkbox"
                />
                <div className="metric-info">
                  <span className="metric-name">{metric.name}</span>
                  <span className="metric-description">{metric.description}</span>
                  <div className="metric-meta">
                    <span className="metric-unit">Unit: {metric.unit}</span>
                    <span className="metric-update">Updates: {metric.updateCycle}</span>
                  </div>
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MetricsList;
