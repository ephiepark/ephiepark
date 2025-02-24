import React from 'react';
import { Metric, MetricData } from '../../../types/emetric';
import MetricCard from './MetricCard';
import './MetricCard.css';

interface MetricGridProps {
  metrics: Metric[];
  data: Record<string, MetricData[]>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

const MetricGrid: React.FC<MetricGridProps> = ({
  metrics,
  data,
  loading,
  errors
}) => {
  const sortedMetrics = [...metrics].sort((a, b) => {
    // Sort by category first
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    
    // Then by name
    return a.name.localeCompare(b.name);
  });

  // Group metrics by category
  const metricsByCategory = sortedMetrics.reduce<Record<string, Metric[]>>(
    (acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    },
    {}
  );

  return (
    <div className="metric-grid-container">
      {Object.entries(metricsByCategory).map(([category, categoryMetrics]) => (
        <div key={category} className="metric-category-section">
          <h2 className="metric-category-title">{category}</h2>
          <div className="metric-grid">
            {categoryMetrics.map(metric => (
              <MetricCard
                key={metric.id}
                metric={metric}
                data={data[metric.id]}
                loading={loading[metric.id]}
                error={errors[metric.id]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricGrid;
