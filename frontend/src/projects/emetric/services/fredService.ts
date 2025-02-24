import { DataSource, Metric, MetricData } from '../../../types/emetric';

interface FredConfig {
  apiKey: string;
  baseUrl: string;
}

interface FredResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: {
    realtime_start: string;
    realtime_end: string;
    date: string;
    value: string;
  }[];
}

class FredService {
  private config: FredConfig;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: 'https://api.stlouisfed.org/fred/series'
    };
  }

  async fetchMetricData(metric: Metric): Promise<MetricData[]> {
    if (!metric.sourceKey) {
      throw new Error('FRED series ID (sourceKey) is required');
    }

    const params = new URLSearchParams({
      series_id: metric.sourceKey,
      api_key: this.config.apiKey,
      file_type: 'json',
      observation_start: this.getStartDate(metric.frequency),
      observation_end: new Date().toISOString().split('T')[0]
    });

    const response = await fetch(
      `${this.config.baseUrl}/observations?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.statusText}`);
    }

    const data: FredResponse = await response.json();
    
    return data.observations
      .filter(obs => obs.value !== '.')  // Filter out missing values
      .map(obs => ({
        metricId: metric.id,
        timestamp: new Date(obs.date).getTime(),
        value: parseFloat(obs.value)
      }));
  }

  private getStartDate(frequency: string): string {
    const now = new Date();
    const date = new Date(now);

    switch (frequency) {
      case 'daily':
        date.setMonth(now.getMonth() - 3);  // Last 3 months
        break;
      case 'weekly':
        date.setMonth(now.getMonth() - 6);  // Last 6 months
        break;
      case 'monthly':
        date.setFullYear(now.getFullYear() - 2);  // Last 2 years
        break;
      case 'quarterly':
        date.setFullYear(now.getFullYear() - 5);  // Last 5 years
        break;
      case 'yearly':
        date.setFullYear(now.getFullYear() - 10);  // Last 10 years
        break;
      default:
        date.setFullYear(now.getFullYear() - 1);  // Default to 1 year
    }

    return date.toISOString().split('T')[0];
  }

  async validateSeriesId(seriesId: string): Promise<boolean> {
    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: this.config.apiKey,
      file_type: 'json'
    });

    try {
      const response = await fetch(
        `${this.config.baseUrl}?${params.toString()}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  static createDataSource(apiKey: string): DataSource {
    return {
      id: 'fred',
      name: 'Federal Reserve Economic Data (FRED)',
      type: 'fred',
      config: {
        apiKey,
        baseUrl: 'https://api.stlouisfed.org/fred/series'
      },
      enabled: true
    };
  }
}

export default FredService;
