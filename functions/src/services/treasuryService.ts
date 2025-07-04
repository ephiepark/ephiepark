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
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Treasury API error: ${response.statusText}`);
    }
    
    const data = await response.json() as { 
      data: Array<{
        record_date: string;
        total_mil_amt: string;
        [key: string]: string;
      }> 
    };
    
    return data.data
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
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Treasury API error: ${response.statusText}`);
    }
    
    const data = await response.json() as { 
      data: Array<{
        record_date: string;
        total_mil_amt: string;
        [key: string]: string;
      }> 
    };
    
    return data.data
      .filter(item => item.total_mil_amt !== null)
      .map(item => ({
        timestamp: new Date(item.record_date).getTime(),
        value: parseFloat(item.total_mil_amt) / 1000, // Convert from millions to billions
      }));
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
  /**
   * Fetches US Debt Expiration data from Treasury MSPD
   * @param date - The record date in YYYY-MM-DD format
   * @return The fetched and aggregated debt expiration data
   */
  async fetchMarketableDebtExpirationData(date: string): Promise<TreasuryMetricData[]> {
    const endpoint = "/v1/debt/mspd/mspd_table_3_market";
    const filter = `record_date:eq:${date}`;
    const pageSize = 10000;
    
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service${endpoint}?filter=${filter}&page[number]=1&page[size]=${pageSize}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Treasury API error: ${response.statusText}`);
    }
    
    const data = await response.json() as { 
      data: Array<{
        maturity_date: string;
        outstanding_amt: string;
        [key: string]: string;
      }> 
    };
    
    // Process and aggregate the data by maturity date
    const aggregatedData = this.aggregateByMaturityDate(data.data);
    
    return aggregatedData.map(item => ({
      timestamp: new Date(item.maturity_date).getTime(),
      value: item.outstanding_amt
    }));
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
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Treasury API error: ${response.statusText}`);
    }
    
    const data = await response.json() as { 
      data: Array<{
        record_date: string;
        total_mil_amt: string;
        [key: string]: string;
      }> 
    };
    
    return data.data
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
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Treasury API error: ${response.statusText}`);
    }
    
    const data = await response.json() as { 
      data: Array<{
        record_date: string;
        total_mil_amt: string;
        [key: string]: string;
      }> 
    };
    
    return data.data
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
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Treasury API error: ${response.statusText}`);
    }
    
    const data = await response.json() as { 
      data: Array<{
        record_date: string;
        total_mil_amt: string;
        [key: string]: string;
      }> 
    };
    
    return data.data
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
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Treasury API error: ${response.statusText}`);
    }
    
    const data = await response.json() as { 
      data: Array<{
        record_date: string;
        total_mil_amt: string;
        [key: string]: string;
      }> 
    };
    
    return data.data
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
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Treasury API error: ${response.statusText}`);
    }
    
    const data = await response.json() as { 
      data: Array<{
        record_date: string;
        total_mil_amt: string;
        [key: string]: string;
      }> 
    };
    
    return data.data
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
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Treasury API error: ${response.statusText}`);
    }
    
    const data = await response.json() as { 
      data: Array<{
        record_date: string;
        total_mil_amt: string;
        [key: string]: string;
      }> 
    };
    
    return data.data
      .filter(item => item.total_mil_amt !== null)
      .map(item => ({
        timestamp: new Date(item.record_date).getTime(),
        value: parseFloat(item.total_mil_amt) / 1000, // Convert from millions to billions
      }));
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
