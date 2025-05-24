import fetch from "node-fetch";

/**
 * Interface for metric data returned by Treasury API
 */
export interface TreasuryMetricData {
  timestamp: number;
  value: number;
}

/**
 * Service for interacting with the Treasury API
 */
export class TreasuryService {
  private config: {
    baseUrl: string;
  };

  /**
   * Creates a new Treasury service instance
   */
  constructor() {
    this.config = {
      baseUrl: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2",
    };
  }

  /**
   * Fetches Treasury Bond Average Interest Rate data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchTreasuryBondAvgInterestRateData(startDate?: string): Promise<TreasuryMetricData[]> {
    const endpoint = "/accounting/od/avg_interest_rates";
    const filter = startDate 
      ? `security_desc:eq:Treasury%20Bonds,record_date:gte:${startDate}`
      : "security_desc:eq:Treasury%20Bonds";
    const pageSize = 1000;
    
    const url = `${this.config.baseUrl}${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Treasury API error: ${response.statusText}`);
    }
    
    const data = await response.json() as { 
      data: Array<{
        record_date: string;
        avg_interest_rate_amt: string;
        [key: string]: string;
      }> 
    };
    
    return data.data
      .filter(item => item.avg_interest_rate_amt !== null)
      .map(item => ({
        timestamp: new Date(item.record_date).getTime(),
        value: parseFloat(item.avg_interest_rate_amt),
      }));
  }
}

export default TreasuryService;
