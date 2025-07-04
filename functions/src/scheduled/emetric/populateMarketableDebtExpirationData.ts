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

export const asyncPopulateMarketableDebtExpirationData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  try {
    logger.info("Starting asyncPopulateDebtExpirationData");
    
    // Create Treasury service instance
    const treasuryService = new TreasuryService();
    
    // Get the last day of the previous month
    const recordDate = getLastDayOfPreviousMonth();
    
    // Fetch debt expiration data
    logger.info(`Fetching Debt Expiration data from Treasury API for date: ${recordDate}`);
    const debtData = await treasuryService.fetchMarketableDebtExpirationData(recordDate);
    
    if (debtData.length === 0) {
      logger.warn("No Debt Expiration data returned from Treasury API");
      return;
    }
    
    // Transform data to Emetric format
    const timeSeriesEntries: Emetric_TimeSeriesEntry[] = debtData.map(item => ({
      timestamp: Math.floor(item.timestamp / 1000),
      value: item.value
    }));
    
    // Store time series data in Firestore
    const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metric.id);
    
    // Create or update the time series document
    await timeSeriesRef.set({
      id: metric.id,
      entries: timeSeriesEntries
    } as Emetric_TimeSeries);
    
    logger.info(`Successfully stored ${timeSeriesEntries.length} Debt Expiration data points`);
  } catch (error) {
    logger.error("Error on asyncPopulateDebtExpirationData:", error);
    throw error;
  }
};
