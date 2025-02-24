import { useState, useEffect } from 'react';
import { Metric, MetricData } from '../../../types/emetric';
import FirebaseApi from '../../../firebase/FirebaseApi';

interface MetricDataState {
  data: Record<string, MetricData[]>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  lastUpdated: Record<string, number>;
}

interface UseMetricDataProps {
  metrics: Metric[];
}

export const useMetricData = ({ metrics }: UseMetricDataProps) => {
  const [state, setState] = useState<MetricDataState>({
    data: {},
    loading: {},
    errors: {},
    lastUpdated: {}
  });

  useEffect(() => {
    const fetchData = async () => {
      metrics.forEach(metric => {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, [metric.id]: true }
        }));
      });

      try {
        const api = FirebaseApi.getInstance();
        const metricsData = await api.emetric_getMetricData();
        
        // Group data by metricId
        const groupedData = metricsData.reduce((acc, data) => {
          if (!acc[data.metricId]) {
            acc[data.metricId] = [];
          }
          acc[data.metricId].push(data);
          return acc;
        }, {} as Record<string, MetricData[]>);

        setState(prev => ({
          ...prev,
          data: groupedData,
          loading: metrics.reduce((acc, metric) => {
            acc[metric.id] = false;
            return acc;
          }, {} as Record<string, boolean>),
          lastUpdated: metrics.reduce((acc, metric) => {
            acc[metric.id] = Date.now();
            return acc;
          }, {} as Record<string, number>)
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState(prev => ({
          ...prev,
          errors: metrics.reduce((acc, metric) => {
            acc[metric.id] = errorMessage;
            return acc;
          }, {} as Record<string, string>),
          loading: metrics.reduce((acc, metric) => {
            acc[metric.id] = false;
            return acc;
          }, {} as Record<string, boolean>)
        }));
      }
    };

    fetchData();
  }, [metrics]);

  return {
    data: state.data,
    loading: state.loading,
    errors: state.errors,
    lastUpdated: state.lastUpdated
  };
};

export default useMetricData;
