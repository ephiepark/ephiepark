import React, { useState } from 'react';
import { Emetric_Metric, Emetric_Derived_Timeseries_Definition } from '../../../shared/types';
import FormulaBuilder from './FormulaBuilder';
import FirebaseApi from '../../../firebase/FirebaseApi';

interface DerivedTimeSeriesCreatorProps {
  metrics: Emetric_Metric[];
}

const DerivedTimeSeriesCreator: React.FC<DerivedTimeSeriesCreatorProps> = ({ metrics }) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
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

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formula.trim()) {
      setError('Formula is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const derivedTimeSeriesDefinition: Emetric_Derived_Timeseries_Definition = {
        id: `derived_${name}`, // Generate a unique ID
        description,
        alignmentStrategy,
        formula
      };

      // Save the definition to Firebase
      const api = FirebaseApi.getInstance();
      await api.saveDerivedTimeSeriesDefinition(derivedTimeSeriesDefinition);
      
      // Reset form
      setName('');
      setDescription('');
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
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Interest Payments as % of Expenditures"
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this derived metric represents"
            className="form-control"
            rows={3}
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
