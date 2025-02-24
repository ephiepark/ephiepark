import React from 'react';
import { Metric, MetricData } from '../../../types/emetric';

interface MetricCardProps {
  metric: Metric;
  data?: MetricData[];
  loading?: boolean;
  error?: string | null;
}

const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  data,
  loading = false,
  error = null
}) => {
  const getLatestValue = () => {
    if (!data || data.length === 0) return 'N/A';
    const latest = data[data.length - 1];
    return formatValue(latest.value, metric.unit);
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case '%':
        return `${value.toFixed(2)}%`;
      case '$':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      default:
        return value.toLocaleString();
    }
  };

  const getChangePercentage = () => {
    if (!data || data.length < 2) return null;
    const latest = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    const change = ((latest - previous) / previous) * 100;
    return {
      value: change.toFixed(2),
      isPositive: change >= 0
    };
  };

  const change = getChangePercentage();

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <h3 className="metric-card-title">{metric.name}</h3>
      </div>

      {loading ? (
        <div className="metric-card-loading">Loading...</div>
      ) : error ? (
        <div className="metric-card-error">{error}</div>
      ) : (
        <>
          <div className="metric-card-value">
            {getLatestValue()}
            {change && metric.displayConfig.showChange && (
              <span
                className={`metric-change ${
                  change.isPositive ? 'positive' : 'negative'
                }`}
              >
                {change.isPositive ? '↑' : '↓'} {change.value}%
              </span>
            )}
          </div>

          <div className="metric-card-chart">
            {/* TODO: Add chart visualization */}
          </div>

          <div className="metric-card-footer">
            <span>{metric.frequency}</span>
            <span>Source: {metric.sourceKey}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default MetricCard;
