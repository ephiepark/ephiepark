import React, { useState } from 'react';
import { Emetric_Metric, Emetric_Derived_Timeseries_Definition, Emetric_Metadata } from '../../../shared/types';
import FormulaBuilder from './FormulaBuilder';
import FirebaseApi from '../../../firebase/FirebaseApi';

interface DerivedTimeSeriesCreatorProps {
  metrics: Emetric_Metric[];
}

const DerivedTimeSeriesCreator: React.FC<DerivedTimeSeriesCreatorProps> = ({ metrics }) => {
  const [name, setName] = useState<string>('');
  const [metricName, setMetricName] = useState<string>('');
  const [metricDescription, setMetricDescription] = useState<string>('');
  const [updateCycle, setUpdateCycle] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [unit, setUnit] = useState<'percent' | 'dollar' | 'billions of dollars'>('percent');
  const [source, setSource] = useState<string>('');
  const [formula, setFormula] = useState<string>('');
  const [alignmentStrategy, setAlignmentStrategy] = useState<'previous' | 'future' | 'nearest' | 'interpolate'>('previous');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!metricName.trim()) {
      setError('Metric name is required');
      return;
    }

    if (!metricDescription.trim()) {
      setError('Metric description is required');
      return;
    }

    if (!formula.trim()) {
      setError('Formula is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const derivedId = `derived_${name}`; // Generate a unique ID
      
      const metadata: Emetric_Metadata = {};
      if (source.trim()) {
        metadata.source = source.trim();
      }
      
      const metric: Emetric_Metric = {
        id: derivedId,
        name: metricName,
        description: metricDescription,
        updateCycle,
        unit,
        metadata
      };
      
      const derivedTimeSeriesDefinition: Emetric_Derived_Timeseries_Definition = {
        id: derivedId,
        metric,
        alignmentStrategy,
        formula
      };

      // Save the definition to Firebase
      const api = FirebaseApi.getInstance();
      await api.saveDerivedTimeSeriesDefinition(derivedTimeSeriesDefinition);
      
      // Reset form
      setName('');
      setMetricName('');
      setMetricDescription('');
      setUpdateCycle('monthly');
      setUnit('percent');
      setSource('');
      setFormula('');
      setAlignmentStrategy('previous');
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving derived time series definition:', err);
      setError('Failed to save derived time series definition. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="derived-timeseries-creator">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          Derived time series definition saved successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="derived-timeseries-form">
        <div className="form-group">
          <label htmlFor="name">Id:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., interest_payments_ratio_expenditures"
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="metricName">Metric Name:</label>
          <input
            type="text"
            id="metricName"
            value={metricName}
            onChange={(e) => setMetricName(e.target.value)}
            placeholder="e.g., Interest Payments Ratio"
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="metricDescription">Metric Description:</label>
          <textarea
            id="metricDescription"
            value={metricDescription}
            onChange={(e) => setMetricDescription(e.target.value)}
            placeholder="Describe what this derived metric represents"
            className="form-control"
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="updateCycle">Update Cycle:</label>
          <select
            id="updateCycle"
            value={updateCycle}
            onChange={(e) => setUpdateCycle(e.target.value as any)}
            className="form-control"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="unit">Unit:</label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as any)}
            className="form-control"
          >
            <option value="percent">Percent</option>
            <option value="dollar">Dollar</option>
            <option value="billions of dollars">Billions of Dollars</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="source">Source (optional):</label>
          <input
            type="text"
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g., FRED, Treasury, Custom"
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Formula:</label>
          <FormulaBuilder 
            metrics={metrics}
            value={formula}
            onChange={setFormula}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="alignmentStrategy">Alignment Strategy:</label>
          <select
            id="alignmentStrategy"
            value={alignmentStrategy}
            onChange={(e) => setAlignmentStrategy(e.target.value as any)}
            className="form-control"
          >
            <option value="previous">Previous Value</option>
            <option value="future">Future Value</option>
            <option value="nearest">Nearest Value</option>
            <option value="interpolate">Interpolate</option>
          </select>
          <small className="form-text">
            Determines how to align time series data points when timestamps don't match exactly.
          </small>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="save-button"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Derived Time Series'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DerivedTimeSeriesCreator;
