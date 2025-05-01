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
import {Emetric_TimeSeries, Emetric_Metric} from 'shared/types';

// Define colors for different metrics
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
  // If no metrics are selected, show a message
  if (selectedMetrics.length === 0) {
    return (
      <div className="time-series-chart-empty">
        <p>Select metrics from the list to display data</p>
      </div>
    );
  }

  // If no data is available for the selected metrics, show a message
  const hasData = selectedMetrics.some(id => 
    timeSeriesData[id] && timeSeriesData[id]?.entries.length > 0
  );

  if (!hasData) {
    return (
      <div className="time-series-chart-empty">
        <p>No data available for the selected metrics</p>
      </div>
    );
  }

  // Prepare data for the chart
  // We need to merge all time series data into a single array of data points
  // Each data point will have a timestamp and values for each selected metric
  const chartData = prepareChartData(timeSeriesData, selectedMetrics);

  // Get the unit for each metric to display on the Y-axis
  const metricUnits = selectedMetrics.map(id => {
    const metric = metrics.find(m => m.id === id);
    return metric ? metric.unit : '';
  });

  // Check if all selected metrics have the same unit
  const allSameUnit = metricUnits.every(unit => unit === metricUnits[0]);

  return (
    <div className="time-series-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
          />
          <YAxis 
            label={{ 
              value: allSameUnit ? metricUnits[0] : 'Value', 
              angle: -90, 
              position: 'insideLeft' 
            }} 
          />
          <Tooltip 
            labelFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
            formatter={(value, name) => {
              const metric = metrics.find(m => m.id === name);
              return [`${value} ${metric?.unit || ''}`, metric?.name || name];
            }}
          />
          <Legend />
          {selectedMetrics.map((metricId, index) => (
            <Line
              key={metricId}
              type="monotone"
              dataKey={metricId}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              activeDot={{ r: 8 }}
              name={metrics.find(m => m.id === metricId)?.name || metricId}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Helper function to prepare data for the chart
const prepareChartData = (
  timeSeriesData: Record<string, Emetric_TimeSeries | null>,
  selectedMetrics: string[]
) => {
  // Get all timestamps from all selected metrics
  const allTimestamps = new Set<number>();
  
  selectedMetrics.forEach(metricId => {
    const timeSeries = timeSeriesData[metricId];
    if (timeSeries) {
      timeSeries.entries.forEach(entry => {
        allTimestamps.add(entry.timestamp * 1000); // Convert to milliseconds
      });
    }
  });

  // Sort timestamps
  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

  // Create data points for each timestamp
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
