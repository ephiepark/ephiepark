import fetch from "node-fetch";

/**
 * Interface for metric data used by FredService
 */
export interface FredMetric {
  sourceKey: string;
}

/**
 * Interface for metric data returned by FRED API
 */
export interface FredMetricData {
  timestamp: number;
  value: number;
}

/**
 * Service for interacting with the FRED API
 */
export class FredService {
  private config: {
    apiKey: string;
    baseUrl: string;
  };

  /**
   * Creates a new FRED service instance
   * @param apiKey - The FRED API key
   */
  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: "https://api.stlouisfed.org/fred/series",
    };
  }

  /**
   * Fetches metric data from FRED API
   * @param metric - The metric to fetch data for
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchMetricData(metric: FredMetric, startDate?: string): Promise<FredMetricData[]> {
    if (!metric.sourceKey) {
      throw new Error("FRED series ID (sourceKey) is required");
    }

    const params = new URLSearchParams({
      series_id: metric.sourceKey,
      api_key: this.config.apiKey,
      file_type: "json",
      observation_end: new Date().toISOString().split("T")[0],
    });
    if (startDate) {
      params.append('observation_start', startDate);
    }
    

    const response = await fetch(`${this.config.baseUrl}/observations?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`FRED API error: ${response.statusText}`);
    }

    const data = await response.json() as { observations: Array<{ date: string; value: string }> };
    
    return data.observations
      .filter((obs) => obs.value !== ".") // Filter out missing values
      .map((obs) => ({
        timestamp: new Date(obs.date).getTime(),
        value: parseFloat(obs.value),
      }));
  }

  /**
   * Validates if a FRED series ID exists
   * @param seriesId - The FRED series ID to validate
   * @return Whether the series ID is valid
   */
  async validateSeriesId(seriesId: string): Promise<boolean> {
    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: this.config.apiKey,
      file_type: "json",
    });

    try {
      const response = await fetch(`${this.config.baseUrl}?${params.toString()}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default FredService;
