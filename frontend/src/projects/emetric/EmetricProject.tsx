import React, { useState, useEffect, useCallback } from 'react';
import { BaseProject } from '../BaseProject';
import { Metric, DataSource, UserPreferences } from '../../types/emetric';
import FirebaseApi from '../../firebase/FirebaseApi';
import MetricGrid from './components/MetricGrid';
import useMetricData from './hooks/useMetricData';
import './EmetricProject.css';

interface EmetricState {
  metrics: Metric[];
  dataSources: DataSource[];
  userPreferences: UserPreferences | null;
  initializing: boolean;
  error: string | null;
}

const EmetricProject: React.FC = () => {
  const [state, setState] = useState<EmetricState>({
    metrics: [],
    dataSources: [],
    userPreferences: null,
    initializing: true,
    error: null
  });

  const { data, loading, errors } = useMetricData({
    metrics: state.metrics
  });

  const loadInitialData = useCallback(async () => {
    try {
      const api = FirebaseApi.getInstance();
      const userId = api.getCurrentUser()?.uid;

      if (!userId) {
        throw new Error('User must be logged in');
      }

      const [metrics, dataSources, preferences] = await Promise.all([
        api.emetric_getMetrics(),
        api.emetric_getDataSources(),
        api.emetric_getUserPreferences(userId)
      ]);

      setState(prev => ({
        ...prev,
        metrics,
        dataSources,
        userPreferences: preferences,
        initializing: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        initializing: false,
        error: error instanceof Error ? error.message : 'Failed to load initial data'
      }));
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleConfigureDataSource = async () => {
    // TODO: Implement data source configuration dialog
  };

  const handleAddMetric = async () => {
    // TODO: Implement metric creation dialog
  };

  if (state.initializing) {
    return (
      <BaseProject id="emetric">
        <div className="emetric-loading">
          Loading economic metrics...
        </div>
      </BaseProject>
    );
  }

  if (state.error) {
    return (
      <BaseProject id="emetric">
        <div className="emetric-error">
          Error: {state.error}
          <button onClick={loadInitialData} className="emetric-retry-button">
            Retry
          </button>
        </div>
      </BaseProject>
    );
  }

  return (
    <BaseProject id="emetric">
      <div className="emetric-container">
        <header className="emetric-header">
          <h2>Economic Metrics Dashboard</h2>
          <div className="emetric-actions">
            <button
              onClick={handleConfigureDataSource}
              className="emetric-action-button"
            >
              Configure Data Sources
            </button>
            <button
              onClick={handleAddMetric}
              className="emetric-action-button primary"
            >
              Add Metric
            </button>
          </div>
        </header>
        
        <main className="emetric-content">
          {state.metrics.length === 0 ? (
            <div className="emetric-empty">
              <h3>No metrics configured</h3>
              <p>Add some metrics to get started with your economic dashboard.</p>
              <button
                onClick={handleAddMetric}
                className="emetric-action-button primary"
              >
                Add Your First Metric
              </button>
            </div>
          ) : (
            <MetricGrid
              metrics={state.metrics}
              data={data}
              loading={loading}
              errors={errors}
            />
          )}
        </main>
      </div>
    </BaseProject>
  );
};

export default EmetricProject;
