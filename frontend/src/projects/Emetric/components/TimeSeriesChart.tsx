
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import {Emetric_TimeSeries, Emetric_Metric} from '../../../shared/types';

// Helper function to format date as YYYY-MM-DD
const formatDateToYYYYMMDD = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part from ISO string
};

// Custom tooltip component to ensure date is visible
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
  metrics: Emetric_Metric[];
}

const CustomTooltip = ({ active, payload, label, metrics }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.5)'
      }}>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.95)', 
          margin: '0 0 5px 0',
          fontWeight: 'bold'
        }}>
          Date: {formatDateToYYYYMMDD(label as number)}
        </p>
        {payload && payload.map((entry: any, index: number) => {
          const metric = metrics.find((m: Emetric_Metric) => m.id === entry.dataKey);
          return (
            <p key={`item-${index}`} style={{ 
              color: entry.color,
              margin: '3px 0' 
            }}>
              {`${metric?.name || entry.name}: ${entry.value} ${metric?.unit || ''}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
  '#00c49f', '#ffbb28', '#ff8042', '#a4de6c', '#d0ed57'
];

interface TimeSeriesChartProps {
  timeSeriesData: Record<string, Emetric_TimeSeries | null>;
  metrics: Emetric_Metric[];
  selectedMetrics: string[];
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ 
  timeSeriesData, 
  metrics, 
  selectedMetrics 
}) => {
  if (selectedMetrics.length === 0) {
    return (
      <div className="time-series-chart-empty">
        <p>Select metrics from the list to display data</p>
      </div>
    );
  }

  const hasData = selectedMetrics.some(id => 
    { 
      if (id in timeSeriesData) {
        const t = timeSeriesData[id];
        if (t !== null && t.entries.length > 0) {
          return true;
        }
      }
      return false;
    }
  );

  if (!hasData) {
    return (
      <div className="time-series-chart-empty">
        <p>No data available for the selected metrics</p>
      </div>
    );
  }

  const chartData = prepareChartData(timeSeriesData, selectedMetrics);

  // Group metrics by unit
  const metricsByUnit: Record<string, string[]> = {};
  selectedMetrics.forEach(metricId => {
    const metric = metrics.find(m => m.id === metricId);
    const unit = metric?.unit || 'unknown';
    if (!metricsByUnit[unit]) {
      metricsByUnit[unit] = [];
    }
    metricsByUnit[unit].push(metricId);
  });

  // Create unique y-axes for each unit
  const uniqueUnits = Object.keys(metricsByUnit);

  return (
    <div className="time-series-chart">
      <ResponsiveContainer width="100%" aspect={2} height={400}>
        <LineChart
          width={500}
          data={chartData}
          margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
          />
          {uniqueUnits.map((unit, index) => (
            <YAxis 
              key={unit}
              yAxisId={unit}
              orientation={index === 0 ? "left" : "right"}
              label={{ 
                value: unit, 
                angle: -90, 
                position: 'insideLeft' 
              }}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
          <Tooltip content={<CustomTooltip metrics={metrics} />} />
          <Legend />
          {selectedMetrics.map((metricId, index) => {
            const metric = metrics.find(m => m.id === metricId);
            return (
              <Line
                key={metricId}
                type="monotone"
                dataKey={metricId}
                yAxisId={metric?.unit || 'unknown'}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                activeDot={{ r: 8 }}
                name={metric?.name || metricId}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const prepareChartData = (
  timeSeriesData: Record<string, Emetric_TimeSeries | null>,
  selectedMetrics: string[]
) => {
  const allTimestamps = new Set<number>();
  
  selectedMetrics.forEach(metricId => {
    const timeSeries = timeSeriesData[metricId];
    if (timeSeries) {
      timeSeries.entries.forEach(entry => {
        allTimestamps.add(entry.timestamp * 1000);
      });
    }
  });

  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

  return sortedTimestamps.map(timestamp => {
    const dataPoint: Record<string, any> = { timestamp };
    
    selectedMetrics.forEach(metricId => {
      const timeSeries = timeSeriesData[metricId];
      if (timeSeries) {
        const entry = timeSeries.entries.find((e: { timestamp: number }) => e.timestamp * 1000 === timestamp);
        dataPoint[metricId] = entry ? entry.value : null;
      } else {
        dataPoint[metricId] = null;
      }
    });
    
    return dataPoint;
  });
};

export default TimeSeriesChart;
