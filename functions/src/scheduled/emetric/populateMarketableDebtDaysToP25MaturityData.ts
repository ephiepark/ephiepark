import { Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { TreasuryService } from "../../services/treasuryService.js";
import { 
  EMETRIC_TIMESERIES_COLLECTION,
  Emetric_Metric,
  Emetric_TimeSeries, 
  Emetric_TimeSeriesEntry 
} from "../../shared/types.js";
import { getLatestTimestamp, getExistingEntries } from "../../shared/emetric/utils.js";

/**
 * Calculates the number of days between two dates
 * @param date1 - The first date
 * @param date2 - The second date
 * @returns The number of days between the two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  // Convert both dates to milliseconds since epoch
  const date1Ms = date1.getTime();
  const date2Ms = date2.getTime();
  
  // Calculate the difference in milliseconds
  const differenceMs = Math.abs(date2Ms - date1Ms);
  
  // Convert milliseconds to days
  return Math.round(differenceMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates days to p25 maturity for a specific record date
 * @param recordDate - The record date in YYYY-MM-DD format
 * @param debtData - The debt expiration data
 * @returns The number of days to p25 maturity or null if it cannot be calculated
 */
async function calculateDaysToP25Maturity(recordDate: string, debtData: TreasuryService['fetchMarketableDebtExpirationData'] extends (...args: any[]) => Promise<infer R> ? R : never): Promise<number | null> {
  if (debtData.length === 0) {
    logger.warn(`No debt expiration data for record date: ${recordDate}`);
    return null;
  }
  
  // Sort entries by timestamp (maturity date)
  const sortedEntries = [...debtData].sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate total outstanding debt
  const totalDebt = sortedEntries.reduce((sum, entry) => sum + entry.value, 0);
  
  if (totalDebt <= 0) {
    logger.warn(`Total debt is zero or negative for record date: ${recordDate}`);
    return null;
  }
  
  // Calculate cumulative debt and find p25 maturity date
  let cumulativeDebt = 0;
  let p25MaturityDate: Date | null = null;
  const recordDateObj = new Date(recordDate);
  
  for (const entry of sortedEntries) {
    cumulativeDebt += entry.value;
    const percentile = (cumulativeDebt * 1.0 / totalDebt) * 100;
    
    // If we've reached or exceeded 25%, and haven't found the p25 date yet
    if (percentile >= 25 && p25MaturityDate === null) {
      p25MaturityDate = new Date(entry.timestamp);
      break;
    }
  }
  
  if (!p25MaturityDate) {
    logger.warn(`Could not determine p25 maturity date for record date: ${recordDate}`);
    return null;
  }
  
  // Calculate days between record date and p25 maturity date
  return daysBetween(recordDateObj, p25MaturityDate);
}

/**
 * Calculates and populates the days to p25 maturity data
 * This metric shows how many days until 25% of the outstanding marketable debt matures from the record date
 * 
 * @param db - Firestore database instance
 * @param metric - The metric definition
 */
export const asyncPopulateMarketableDebtDaysToP25MaturityData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  try {
    logger.info("Starting asyncPopulateMarketableDebtDaysToP25MaturityData");
    
    // Create Treasury service instance
    const treasuryService = new TreasuryService();
    
    // Check if we have existing data and get the latest timestamp
    const latestTimestamp = await getLatestTimestamp(db, metric.id);
    
    if (latestTimestamp) {
      // We have existing data, fetch only new data since the latest timestamp
      logger.info(`Found existing Days to P25 Maturity data with latest timestamp: ${new Date(latestTimestamp * 1000).toISOString()}`);
      
      // Get existing entries
      const existingEntries = await getExistingEntries(db, metric.id);
      
      // Convert timestamp to date string for API (add 2 days worth of seconds to avoid duplicates)
      const startDate = new Date((latestTimestamp + 60 * 60 * 24 * 2) * 1000).toISOString().split('T')[0];
      
      // Fetch record dates since the latest timestamp
      logger.info(`Fetching record dates from Treasury API since ${startDate}`);
      const recordDates = await treasuryService.fetchMarketableDebtRecordDates(startDate);
      
      if (recordDates.length === 0) {
        logger.info("No new record dates available since last update");
        return;
      }
      
      logger.info(`Found ${recordDates.length} new record dates to process`);
      
      // Process each record date
      const newEntries: Emetric_TimeSeriesEntry[] = [];
      
      for (const recordDate of recordDates) {
        logger.info(`Processing record date: ${recordDate}`);
        
        // Fetch debt expiration data for this record date
        const debtData = await treasuryService.fetchMarketableDebtExpirationData(recordDate);
        
        // Calculate days to p25 maturity
        const daysToP25Maturity = await calculateDaysToP25Maturity(recordDate, debtData);
        
        if (daysToP25Maturity !== null) {
          logger.info(`Days to p25 maturity for ${recordDate}: ${daysToP25Maturity}`);
          
          // Create time series entry
          newEntries.push({
            timestamp: Math.floor(new Date(recordDate).getTime() / 1000), // Convert to seconds
            value: daysToP25Maturity
          });
        }
      }
      
      if (newEntries.length === 0) {
        logger.info("No new entries to add");
        return;
      }
      
      // Combine existing and new entries
      const combinedEntries = [...existingEntries, ...newEntries];
      
      // Store combined time series data in Firestore
      const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metric.id);
      await timeSeriesRef.set({
        id: metric.id,
        entries: combinedEntries
      } as Emetric_TimeSeries);
      
      logger.info(`Successfully added ${newEntries.length} new Days to P25 Maturity data points to existing ${existingEntries.length} points`);
    } else {
      // No existing data, fetch all data
      logger.info("No existing Days to P25 Maturity data found, fetching all available data");
      
      // Fetch all available record dates
      logger.info("Fetching all available record dates from Treasury API");
      const recordDates = await treasuryService.fetchMarketableDebtRecordDates();
      
      if (recordDates.length === 0) {
        logger.warn("No record dates returned from Treasury API");
        return;
      }
      
      logger.info(`Found ${recordDates.length} record dates to process`);
      
      // Process each record date
      const timeSeriesEntries: Emetric_TimeSeriesEntry[] = [];
      
      for (const recordDate of recordDates) {
        logger.info(`Processing record date: ${recordDate}`);
        
        // Fetch debt expiration data for this record date
        const debtData = await treasuryService.fetchMarketableDebtExpirationData(recordDate);
        
        // Calculate days to p25 maturity
        const daysToP25Maturity = await calculateDaysToP25Maturity(recordDate, debtData);
        
        if (daysToP25Maturity !== null) {
          logger.info(`Days to p25 maturity for ${recordDate}: ${daysToP25Maturity}`);
          
          // Create time series entry
          timeSeriesEntries.push({
            timestamp: Math.floor(new Date(recordDate).getTime() / 1000), // Convert to seconds
            value: daysToP25Maturity
          });
        }
      }
      
      if (timeSeriesEntries.length === 0) {
        logger.warn("No Days to P25 Maturity data could be calculated");
        return;
      }
      
      // Store time series data in Firestore
      const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metric.id);
      
      // Create or update the time series document
      await timeSeriesRef.set({
        id: metric.id,
        entries: timeSeriesEntries
      } as Emetric_TimeSeries);
      
      logger.info(`Successfully stored ${timeSeriesEntries.length} Days to P25 Maturity data points`);
    }
  } catch (error) {
    logger.error("Error on asyncPopulateMarketableDebtDaysToP25MaturityData:", error);
    throw error;
  }
};
