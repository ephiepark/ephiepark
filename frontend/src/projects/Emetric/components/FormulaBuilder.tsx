import React, { useState } from 'react';
import { Emetric_Metric } from '../../../shared/types';

interface FormulaBuilderProps {
  metrics: Emetric_Metric[];
  value: string;
  onChange: (formula: string) => void;
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({ metrics, value, onChange }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('');

  const handleAddMetric = () => {
    if (selectedMetric) {
      // Add the metric ID wrapped in double curly braces to the formula
      const metricToken = `{{${selectedMetric}}}`;
      onChange(value ? `${value} ${metricToken}` : metricToken);
      setSelectedMetric('');
    }
  };

  const handleAddOperator = (operator: string) => {
    onChange(value ? `${value} ${operator} ` : `${operator} `);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="formula-builder">
      <div className="formula-preview">
        <div className="formula-display">
          {value || <span className="formula-placeholder">Your formula will appear here</span>}
        </div>
      </div>
      
      <div className="formula-controls">
        <div className="metric-selector">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="form-control"
          >
            <option value="">Select a metric</option>
            {metrics.map(metric => (
              <option key={metric.id} value={metric.id}>
                {metric.name}
              </option>
            ))}
          </select>
          <button 
            type="button" 
            onClick={handleAddMetric}
            disabled={!selectedMetric}
            className="add-metric-button"
          >
            Add Metric
          </button>
        </div>
        
        <div className="operator-buttons">
          <button type="button" onClick={() => handleAddOperator('+')} className="operator-button">+</button>
          <button type="button" onClick={() => handleAddOperator('-')} className="operator-button">-</button>
          <button type="button" onClick={() => handleAddOperator('*')} className="operator-button">×</button>
          <button type="button" onClick={() => handleAddOperator('/')} className="operator-button">÷</button>
          <button type="button" onClick={() => handleAddOperator('(')} className="operator-button">(</button>
          <button type="button" onClick={() => handleAddOperator(')')} className="operator-button">)</button>
        </div>
        
        <button type="button" onClick={handleClear} className="clear-button">
          Clear
        </button>
      </div>
      
      <div className="formula-help">
        <h4>Formula Help</h4>
        <p>Create a formula using metrics and operators:</p>
        <ul>
          <li>Select metrics from the dropdown and click "Add Metric"</li>
          <li>Use operators (+, -, ×, ÷) to combine metrics</li>
          <li>Use parentheses to control order of operations</li>
        </ul>
        <p>Example: <code>&#123;&#123;fred_us_interest_payments_id&#125;&#125; / &#123;&#123;fred_us_federal_expenditures_id&#125;&#125; * 100</code></p>
      </div>
    </div>
  );
};

export default FormulaBuilder;
