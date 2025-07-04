import React, { useState, useEffect } from 'react';
import { metricRegistry } from '../../../shared/emetric/metricRegistry';
import { Emetric_Metric, Emetric_Derived_Timeseries_Definition } from '../../../shared/types';
import DerivedTimeSeriesCreator from './DerivedTimeSeriesCreator';
import FirebaseApi from '../../../firebase/FirebaseApi';

const MetricExplorer: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<Emetric_Metric | null>(null);
  const [derivedMetrics, setDerivedMetrics] = useState<Emetric_Metric[]>([]);
  const [allMetrics, setAllMetrics] = useState<Emetric_Metric[]>(metricRegistry);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch derived time series definitions when component mounts
  useEffect(() => {
    const fetchDerivedTimeSeriesDefinitions = async () => {
      try {
        setLoading(true);
        const api = FirebaseApi.getInstance();
        const definitions = await api.getDerivedTimeSeriesDefinitions();
        
        // Extract metrics from definitions
        const derivedMetricsFromDefinitions = definitions.map(def => def.metric);
        setDerivedMetrics(derivedMetricsFromDefinitions);
        
        // Combine regular metrics with derived metrics
        setAllMetrics([...metricRegistry, ...derivedMetricsFromDefinitions]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching derived time series definitions:', err);
        setError('Failed to load derived time series definitions. Please try again later.');
        setLoading(false);
      }
    };

    fetchDerivedTimeSeriesDefinitions();
  }, []);

  const handleMetricSelect = (metric: Emetric_Metric) => {
    setSelectedMetric(metric);
  };

  return (
    <div className="metric-explorer-container">
      <div className="metric-explorer-header">
        <h2>Metric Explorer</h2>
        <p className="metric-explorer-description">
          Explore available metrics and create derived time series by combining existing metrics with formulas.
        </p>
      </div>

      <div className="metric-explorer-content">
        <div className="metrics-catalog">
          <h3>Available Metrics</h3>
          <div className="metrics-list-container">
            {loading ? (
              <div className="loading-indicator">Loading metrics...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : allMetrics.map(metric => (
              <div 
                key={metric.id} 
                className={`metric-card ${selectedMetric?.id === metric.id ? 'selected' : ''}`}
                onClick={() => handleMetricSelect(metric)}
              >
                <div className="metric-card-header">
                  <h4 className="metric-name">{metric.name}</h4>
                  <span className="metric-unit">{metric.unit}</span>
                </div>
                <p className="metric-description">{metric.description}</p>
                <div className="metric-meta">
                  <span className="metric-update">Updates: {metric.updateCycle}</span>
                  <span className="metric-source">Source: {metric.metadata.source || 'Unknown'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-detail-panel">
          {selectedMetric ? (
            <div className="metric-detail">
              <h3>{selectedMetric.name}</h3>
              <div className="metric-detail-content">
                <div className="metric-detail-section">
                  <h4>Description</h4>
                  <p>{selectedMetric.description}</p>
                </div>
                <div className="metric-detail-section">
                  <h4>Details</h4>
                  <ul className="metric-detail-list">
                    <li><strong>ID:</strong> {selectedMetric.id}</li>
                    <li><strong>Unit:</strong> {selectedMetric.unit}</li>
                    <li><strong>Update Cycle:</strong> {selectedMetric.updateCycle}</li>
                    <li><strong>Source:</strong> {selectedMetric.metadata.source || 'Unknown'}</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="metric-detail-empty">
              <p>Select a metric to view details</p>
            </div>
          )}
        </div>
      </div>

      <div className="derived-timeseries-section">
        <h3>Create Derived Time Series</h3>
        <DerivedTimeSeriesCreator metrics={allMetrics} />
      </div>
    </div>
  );
};

export default MetricExplorer;
