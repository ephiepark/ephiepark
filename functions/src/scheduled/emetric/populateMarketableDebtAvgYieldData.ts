import { Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { TreasuryService } from "../../services/treasuryService.js";
import { 
  EMETRIC_TIMESERIES_COLLECTION,
  Emetric_Metric,
  Emetric_TimeSeries, 
  Emetric_TimeSeriesEntry 
} from "../../shared/types.js";

/**
 * Gets the last day of the previous month in YYYY-MM-DD format
 * @returns The last day of the previous month as a string
 */
function getLastDayOfPreviousMonth(): string {
  const today = new Date();
  // Create a date for the first day of the current month
  const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  // Subtract one day to get the last day of the previous month
  const lastDayOfPreviousMonth = new Date(firstDayOfCurrentMonth);
  lastDayOfPreviousMonth.setDate(firstDayOfCurrentMonth.getDate() - 1);
  
  // Format as YYYY-MM-DD
  return lastDayOfPreviousMonth.toISOString().split('T')[0];
}

/**
 * Calculates the weighted average yield of outstanding marketable debt
 * For a given date, the value is the average yield of all marketable debt that matures on or before that date
 * The average is weighted by the amount of the debt (issued_amt field)
 * 
 * @param db - Firestore database instance
 * @param metric - The metric definition
 */
export const asyncPopulateMarketableDebtAvgYieldData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  try {
    logger.info("Starting asyncPopulateMarketableDebtAvgYieldData");
    
    // Create Treasury service instance
    const treasuryService = new TreasuryService();
    
    // Get the last day of the previous month
    const recordDate = getLastDayOfPreviousMonth();
    
    // Fetch raw debt data with yield information
    const debtItems = await treasuryService.fetchMarketableDebtWithYieldData(recordDate);
    
    if (debtItems.length === 0) {
      logger.warn(`No yield data returned from Treasury API for record date: ${recordDate}`);
      return;
    }
    
    // Filter out items with missing or invalid data
    const validDebtItems = debtItems.filter(item => {
      return item.maturity_date && 
             item.maturity_date !== 'null' && 
             item.yield_pct && 
             item.yield_pct !== 'null' && 
             item.issued_amt && 
             item.issued_amt !== 'null';
    });
    
    if (validDebtItems.length === 0) {
      logger.warn(`No valid debt items found for record date: ${recordDate}`);
      return;
    }
    
    // Sort by maturity date
    const sortedDebtItems = [...validDebtItems].sort((a, b) => {
      return new Date(a.maturity_date).getTime() - new Date(b.maturity_date).getTime();
    });
    
    // Get unique maturity dates
    const uniqueMaturityDates = [...new Set(sortedDebtItems.map(item => item.maturity_date))].sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    
    // Calculate weighted average yield for each maturity date
    const timeSeriesEntries: Emetric_TimeSeriesEntry[] = [];
    
    for (const maturityDate of uniqueMaturityDates) {
      // Filter debt items that mature on or before this date
      const debtItemsBeforeMaturity = sortedDebtItems.filter(item => {
        return new Date(item.maturity_date).getTime() <= new Date(maturityDate).getTime();
      });
      
      // Calculate weighted average yield
      let totalWeightedYield = 0;
      let totalIssuedAmt = 0;
      
      for (const item of debtItemsBeforeMaturity) {
        const yieldPct = parseFloat(item.yield_pct);
        const issuedAmt = parseFloat(item.issued_amt);
        
        if (!isNaN(yieldPct) && !isNaN(issuedAmt) && issuedAmt > 0) {
          totalWeightedYield += yieldPct * issuedAmt;
          totalIssuedAmt += issuedAmt;
        }
      }
      
      if (totalIssuedAmt > 0) {
        const avgYield = totalWeightedYield / totalIssuedAmt;
        
        // Create time series entry
        timeSeriesEntries.push({
          timestamp: Math.floor(new Date(maturityDate).getTime() / 1000), // Convert to seconds
          value: avgYield
        });
      }
    }
    
    if (timeSeriesEntries.length === 0) {
      logger.warn("No Average Yield data could be calculated");
      return;
    }
    
    // Store time series data in Firestore
    const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metric.id);
    
    // Create or update the time series document
    await timeSeriesRef.set({
      id: metric.id,
      entries: timeSeriesEntries
    } as Emetric_TimeSeries);
    
    logger.info(`Successfully stored ${timeSeriesEntries.length} Average Yield data points`);
  } catch (error) {
    logger.error("Error on asyncPopulateMarketableDebtAvgYieldData:", error);
    throw error;
  }
};
