import React, { useState } from 'react';

export type TimeRangePreset = '1y' | '2y' | '5y' | '10y' | '20y' | 'max' | 'custom';

export interface TimeRange {
  startDate: Date | null;
  endDate: Date | null;
  preset: TimeRangePreset;
}

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ 
  selectedRange, 
  onRangeChange 
}) => {
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const calculateDateFromPreset = (preset: TimeRangePreset): TimeRange => {
    const now = new Date();
    const endDate = new Date(now);
    let startDate: Date | null = null;

    switch (preset) {
      case '1y':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case '2y':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 2);
        break;
      case '5y':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 5);
        break;
      case '10y':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 10);
        break;
      case '20y':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 20);
        break;
      case 'max':
        startDate = null;
        break;
      case 'custom':
        return selectedRange; // Keep current dates for custom
      default:
        startDate = null;
    }

    return {
      startDate,
      endDate,
      preset
    };
  };

  const handlePresetClick = (preset: TimeRangePreset) => {
    if (preset === 'custom') {
      setShowCustomRange(true);
      onRangeChange({
        ...selectedRange,
        preset: 'custom'
      });
    } else {
      setShowCustomRange(false);
      onRangeChange(calculateDateFromPreset(preset));
    }
  };

  const handleCustomRangeApply = () => {
    if (customStartDate && customEndDate) {
      onRangeChange({
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate),
        preset: 'custom'
      });
    }
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Initialize custom date inputs when showing custom range
  React.useEffect(() => {
    if (showCustomRange) {
      setCustomStartDate(formatDateForInput(selectedRange.startDate));
      setCustomEndDate(formatDateForInput(selectedRange.endDate));
    }
  }, [showCustomRange, selectedRange]);

  return (
    <div className="time-range-selector">
      <div className="time-range-presets">
        {(['1y', '2y', '5y', '10y', '20y', 'max', 'custom'] as TimeRangePreset[]).map(preset => (
          <button
            key={preset}
            className={`time-range-preset-button ${selectedRange.preset === preset ? 'active' : ''}`}
            onClick={() => handlePresetClick(preset)}
          >
            {preset === 'custom' ? 'Custom' : preset}
          </button>
        ))}
      </div>
      
      {showCustomRange && (
        <div className="custom-range-container">
          <div className="custom-range-inputs">
            <div className="form-group">
              <label htmlFor="start-date">Start Date</label>
              <input
                type="date"
                id="start-date"
                className="form-control"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="end-date">End Date</label>
              <input
                type="date"
                id="end-date"
                className="form-control"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>
          <button 
            className="apply-custom-range-button"
            onClick={handleCustomRangeApply}
            disabled={!customStartDate || !customEndDate}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;
