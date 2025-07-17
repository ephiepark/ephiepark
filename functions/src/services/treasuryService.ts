import fetch from "node-fetch";

/**
 * Interface for metric data returned by Treasury API
 */
export interface TreasuryMetricData {
  timestamp: number;
  value: number;
}

/**
 * Interface for debt expiration data
 */
export interface DebtExpirationData {
  maturity_date: string;
  outstanding_amt: number;
}

/**
 * Interfaces for raw API responses
 */
interface TreasuryRawResponse<T> {
  data: T[];
  meta: {
    count: number;
    [key: string]: any;
  };
  links?: {
    self: string;
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
}

interface TreasuryDebtTableItem {
  record_date: string;
  total_mil_amt: string;
  [key: string]: string;
}

interface TreasuryDebtExpirationItem {
  maturity_date: string;
  outstanding_amt: string;
  [key: string]: string;
}

export interface TreasuryDebtYieldItem {
  maturity_date: string;
  yield_pct: string;
  issued_amt: string;
  [key: string]: string;
}

interface TreasuryInterestRateItem {
  record_date: string;
  avg_interest_rate_amt: string;
  [key: string]: string;
}

/**
 * Service for interacting with the Treasury API
 */
export class TreasuryService {
  // Static cache at the class level
  private static cache: Map<string, any> = new Map();

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

  // Utility method to sleep/delay execution
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper method to get or fetch raw data with generic type
  private async getOrFetchData<T>(url: string): Promise<T> {
    // Check cache first
    if (TreasuryService.cache.has(url)) {
      return TreasuryService.cache.get(url) as T;
    }
    
    // Add retry logic
    let attempts = 0;
    const maxAttempts = 4;
    
    while (attempts < maxAttempts) {
      try {
        // If not in cache, fetch it
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Treasury API error: ${response.statusText}`);
        }
        
        const data = await response.json() as T;
        
        // Store raw data in cache
        TreasuryService.cache.set(url, data);
        
        return data;
      } catch (error) {
        attempts++;
        
        // If we've reached max attempts, throw the error
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // Otherwise, sleep with exponential backoff before retrying
        const sleepTime = 1000 * Math.pow(2, attempts + 2); // 1s, 2s, 4s
        console.log(`Treasury API request failed, retrying (${attempts}/${maxAttempts}) after ${sleepTime}ms...`);
        await this.sleep(sleepTime);
      }
    }
    
    // This should never be reached due to the throw in the catch block
    throw new Error("Failed to fetch data after maximum retry attempts");
  }

  /**
   * Fetches US Total Marketable Debt data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchTotalMarketableDebtData(startDate?: string): Promise<TreasuryMetricData[]> {
    const endpoint = "/v1/debt/mspd/mspd_table_1";
    const filter = startDate 
      ? `security_type_desc:eq:Total%20Marketable,record_date:gte:${startDate}`
      : "security_type_desc:eq:Total%20Marketable";
    const pageSize = 1000;
    
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    // Use the helper method with type parameter
    const rawData = await this.getOrFetchData<TreasuryRawResponse<TreasuryDebtTableItem>>(url);
    
    return rawData.data
      .filter(item => item.total_mil_amt !== null)
      .map(item => ({
        timestamp: new Date(item.record_date).getTime(),
        value: parseFloat(item.total_mil_amt) / 1000, // Convert from millions to billions
      }));
  }

  /**
   * Fetches US Total Nonmarketable Debt data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchTotalNonmarketableDebtData(startDate?: string): Promise<TreasuryMetricData[]> {
    const endpoint = "/v1/debt/mspd/mspd_table_1";
    const filter = startDate 
      ? `security_type_desc:eq:Total%20Nonmarketable,record_date:gte:${startDate}`
      : "security_type_desc:eq:Total%20Nonmarketable";
    const pageSize = 1000;
    
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    // Use the helper method with type parameter
    const rawData = await this.getOrFetchData<TreasuryRawResponse<TreasuryDebtTableItem>>(url);
    
    return rawData.data
      .filter(item => item.total_mil_amt !== null)
      .map(item => ({
        timestamp: new Date(item.record_date).getTime(),
        value: parseFloat(item.total_mil_amt) / 1000, // Convert from millions to billions
      }));
  }

  /**
   * Fetches Average Interest Rate data for a specified security description
   * @param securityDesc - The security description to filter by (e.g., "Treasury Bonds", "Total Marketable")
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchAvgInterestRateData(securityDesc: string, startDate?: string): Promise<TreasuryMetricData[]> {
    const endpoint = "/accounting/od/avg_interest_rates";
    const encodedSecurityDesc = encodeURIComponent(securityDesc);
    const filter = startDate 
      ? `security_desc:eq:${encodedSecurityDesc},record_date:gte:${startDate}`
      : `security_desc:eq:${encodedSecurityDesc}`;
    const pageSize = 1000;
    
    const url = `${this.config.baseUrl}${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    // Use the helper method with type parameter
    const rawData = await this.getOrFetchData<TreasuryRawResponse<TreasuryInterestRateItem>>(url);
    
    return rawData.data
      .filter(item => item.avg_interest_rate_amt !== null)
      .map(item => ({
        timestamp: new Date(item.record_date).getTime(),
        value: parseFloat(item.avg_interest_rate_amt),
      }));
  }

  /**
   * Fetches Treasury Bond Average Interest Rate data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchTreasuryBondAvgInterestRateData(startDate?: string): Promise<TreasuryMetricData[]> {
    return this.fetchAvgInterestRateData("Treasury Bonds", startDate);
  }

  /**
   * Fetches Treasury Bill Average Interest Rate data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchTreasuryBillAvgInterestRateData(startDate?: string): Promise<TreasuryMetricData[]> {
    return this.fetchAvgInterestRateData("Treasury Bills", startDate);
  }

  /**
   * Fetches Treasury Note Average Interest Rate data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchTreasuryNoteAvgInterestRateData(startDate?: string): Promise<TreasuryMetricData[]> {
    return this.fetchAvgInterestRateData("Treasury Notes", startDate);
  }

  /**
   * Fetches Total Marketable Debt Average Interest Rate data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchMarketableDebtAvgInterestRateData(startDate?: string): Promise<TreasuryMetricData[]> {
    return this.fetchAvgInterestRateData("Total Marketable", startDate);
  }
  /**
   * Fetches US Debt Expiration data from Treasury MSPD
   * @param startDate - The start date (YYYY-MM-DD format) for fetching data since that date
   * @return The fetched and aggregated debt expiration data, grouped by record date
   */
  async fetchMarketableDebtExpirationData(
    startDate: string
  ): Promise<Record<string, TreasuryMetricData[]>> {
    const endpoint = "/v1/debt/mspd/mspd_table_3_market";
    const filter = `record_date:gte:${startDate}`;
    const pageSize = 10000;
    
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    // Use the helper method with type parameter
    const rawData = await this.getOrFetchData<TreasuryRawResponse<TreasuryDebtExpirationItem>>(url);
    
    // Group data by record date
    const groupedByRecordDate: Record<string, TreasuryDebtExpirationItem[]> = {};
    
    for (const item of rawData.data) {
      const recordDate = item.record_date;
      if (!groupedByRecordDate[recordDate]) {
        groupedByRecordDate[recordDate] = [];
      }
      groupedByRecordDate[recordDate].push(item);
    }
    
    // Process each group separately
    const result: Record<string, TreasuryMetricData[]> = {};
    
    for (const [recordDate, items] of Object.entries(groupedByRecordDate)) {
      // Process and aggregate the data by maturity date for this record date
      const aggregatedData = this.aggregateByMaturityDate(items);
      
      result[recordDate] = aggregatedData.map(item => ({
        timestamp: new Date(item.maturity_date).getTime(),
        value: item.outstanding_amt
      }));
    }
    
    return result;
  }

  /**
   * Fetches available record dates for marketable debt data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return Array of record dates in YYYY-MM-DD format
   */
  async fetchMarketableDebtRecordDates(startDate?: string): Promise<string[]> {
    const endpoint = "/v1/debt/mspd/mspd_table_3_market";
    const filter = startDate 
      ? `security_class1_desc:eq:Total%20Marketable,record_date:gte:${startDate}`
      : 'security_class1_desc:eq:Total%20Marketable';
    const pageSize = 10000;
    
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    // Use the helper method with type parameter
    const rawData = await this.getOrFetchData<TreasuryRawResponse<{record_date: string; [key: string]: string;}>>(url);
    
    // Extract unique record dates and sort them in ascending order
    const recordDates = [...new Set(rawData.data.map(item => item.record_date))];
    return recordDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  /**
   * Fetches US Marketable Debt - Bills data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchMarketableDebtBillsData(startDate?: string): Promise<TreasuryMetricData[]> {
    const endpoint = "/v1/debt/mspd/mspd_table_1";
    const filter = startDate 
      ? `security_class_desc:eq:Bills,security_type_desc:eq:Marketable,record_date:gte:${startDate}`
      : "security_class_desc:eq:Bills,security_type_desc:eq:Marketable";
    const pageSize = 1000;
    
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    // Use the helper method with type parameter
    const rawData = await this.getOrFetchData<TreasuryRawResponse<TreasuryDebtTableItem>>(url);
    
    return rawData.data
      .filter(item => item.total_mil_amt !== null)
      .map(item => ({
        timestamp: new Date(item.record_date).getTime(),
        value: parseFloat(item.total_mil_amt) / 1000, // Convert from millions to billions
      }));
  }

  /**
   * Fetches US Marketable Debt - Notes data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchMarketableDebtNotesData(startDate?: string): Promise<TreasuryMetricData[]> {
    const endpoint = "/v1/debt/mspd/mspd_table_1";
    const filter = startDate 
      ? `security_class_desc:eq:Notes,security_type_desc:eq:Marketable,record_date:gte:${startDate}`
      : "security_class_desc:eq:Notes,security_type_desc:eq:Marketable";
    const pageSize = 1000;
    
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    // Use the helper method with type parameter
    const rawData = await this.getOrFetchData<TreasuryRawResponse<TreasuryDebtTableItem>>(url);
    
    return rawData.data
      .filter(item => item.total_mil_amt !== null)
      .map(item => ({
        timestamp: new Date(item.record_date).getTime(),
        value: parseFloat(item.total_mil_amt) / 1000, // Convert from millions to billions
      }));
  }

  /**
   * Fetches US Marketable Debt - Bonds data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchMarketableDebtBondsData(startDate?: string): Promise<TreasuryMetricData[]> {
    const endpoint = "/v1/debt/mspd/mspd_table_1";
    const filter = startDate 
      ? `security_class_desc:eq:Bonds,security_type_desc:eq:Marketable,record_date:gte:${startDate}`
      : "security_class_desc:eq:Bonds,security_type_desc:eq:Marketable";
    const pageSize = 1000;
    
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    // Use the helper method with type parameter
    const rawData = await this.getOrFetchData<TreasuryRawResponse<TreasuryDebtTableItem>>(url);
    
    return rawData.data
      .filter(item => item.total_mil_amt !== null)
      .map(item => ({
        timestamp: new Date(item.record_date).getTime(),
        value: parseFloat(item.total_mil_amt) / 1000, // Convert from millions to billions
      }));
  }

  /**
   * Fetches US Marketable Debt - Treasury Inflation-Protected Securities data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchMarketableDebtTIPSData(startDate?: string): Promise<TreasuryMetricData[]> {
    const endpoint = "/v1/debt/mspd/mspd_table_1";
    const filter = startDate 
      ? `security_class_desc:eq:Treasury%20Inflation-Protected%20Securities,security_type_desc:eq:Marketable,record_date:gte:${startDate}`
      : "security_class_desc:eq:Treasury%20Inflation-Protected%20Securities,security_type_desc:eq:Marketable";
    const pageSize = 1000;
    
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    // Use the helper method with type parameter
    const rawData = await this.getOrFetchData<TreasuryRawResponse<TreasuryDebtTableItem>>(url);
    
    return rawData.data
      .filter(item => item.total_mil_amt !== null)
      .map(item => ({
        timestamp: new Date(item.record_date).getTime(),
        value: parseFloat(item.total_mil_amt) / 1000, // Convert from millions to billions
      }));
  }

  /**
   * Fetches US Marketable Debt - Floating Rate Notes data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchMarketableDebtFRNData(startDate?: string): Promise<TreasuryMetricData[]> {
    const endpoint = "/v1/debt/mspd/mspd_table_1";
    const filter = startDate 
      ? `security_class_desc:eq:Floating%20Rate%20Notes,security_type_desc:eq:Marketable,record_date:gte:${startDate}`
      : "security_class_desc:eq:Floating%20Rate%20Notes,security_type_desc:eq:Marketable";
    const pageSize = 1000;
    
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    // Use the helper method with type parameter
    const rawData = await this.getOrFetchData<TreasuryRawResponse<TreasuryDebtTableItem>>(url);
    
    return rawData.data
      .filter(item => item.total_mil_amt !== null)
      .map(item => ({
        timestamp: new Date(item.record_date).getTime(),
        value: parseFloat(item.total_mil_amt) / 1000, // Convert from millions to billions
      }));
  }

  /**
   * Fetches US Marketable Debt - Federal Financing Bank data
   * @param startDate - Optional specific start date (YYYY-MM-DD format)
   * @return The fetched metric data
   */
  async fetchMarketableDebtFFBData(startDate?: string): Promise<TreasuryMetricData[]> {
    const endpoint = "/v1/debt/mspd/mspd_table_1";
    const filter = startDate 
      ? `security_class_desc:eq:Federal%20Financing%20Bank,security_type_desc:eq:Marketable,record_date:gte:${startDate}`
      : "security_class_desc:eq:Federal%20Financing%20Bank,security_type_desc:eq:Marketable";
    const pageSize = 1000;
    
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    // Use the helper method with type parameter
    const rawData = await this.getOrFetchData<TreasuryRawResponse<TreasuryDebtTableItem>>(url);
    
    return rawData.data
      .filter(item => item.total_mil_amt !== null)
      .map(item => ({
        timestamp: new Date(item.record_date).getTime(),
        value: parseFloat(item.total_mil_amt) / 1000, // Convert from millions to billions
      }));
  }

  /**
   * Fetches marketable debt data with yield information
   * @param date - The record date in YYYY-MM-DD format
   * @return The raw debt data including yield information
   */
  async fetchMarketableDebtWithYieldData(date: string): Promise<TreasuryDebtYieldItem[]> {
    const endpoint = "/v1/debt/mspd/mspd_table_3_market";
    const filter = `record_date:eq:${date}`;
    const pageSize = 10000;
    
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    // Use the helper method with type parameter
    const rawData = await this.getOrFetchData<TreasuryRawResponse<TreasuryDebtYieldItem>>(url);
    
    if (!rawData.data || rawData.data.length === 0) {
      return [];
    }
    
    return rawData.data;
  }

  /**
   * Aggregates debt data by maturity date
   * @param data - Raw data from Treasury API
   * @return Aggregated data by maturity date
   */
  private aggregateByMaturityDate(data: Array<{
    maturity_date: string;
    outstanding_amt: string;
    [key: string]: string;
  }>): DebtExpirationData[] {
    // Group by maturity date and sum outstanding amounts
    const aggregated = data.reduce((acc, item) => {
      const maturityDate = item.maturity_date;
      if (!maturityDate || maturityDate === 'null') return acc;
      
      const outstandingAmt = parseFloat(item.outstanding_amt);
      if (isNaN(outstandingAmt)) return acc;
      
      if (!acc[maturityDate]) {
        acc[maturityDate] = 0;
      }
      acc[maturityDate] += outstandingAmt;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array format
    return Object.entries(aggregated).map(([maturity_date, outstanding_amt]) => ({
      maturity_date,
      outstanding_amt: outstanding_amt / 1000 // Convert to billions
    }));
  }
}

export default TreasuryService;
