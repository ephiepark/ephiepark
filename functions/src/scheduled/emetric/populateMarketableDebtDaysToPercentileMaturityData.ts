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
import { calculateDaysToPercentileMaturity } from "../../utils/emetric/marketableDebtUtils.js";

/**
 * Generic function to calculate and populate days to percentile maturity data
 * This metric shows how many days until a specified percentage of the outstanding marketable debt matures from the record date
 * 
 * @param db - Firestore database instance
 * @param metric - The metric definition
 * @param percentileThreshold - The percentile threshold (e.g., 25, 50, 75, 90)
 */
export const populateMarketableDebtDaysToPercentileMaturityData = async (
  db: Firestore, 
  metric: Emetric_Metric,
  percentileThreshold: number
): Promise<void> => {
  try {
    logger.info(`Starting populateMarketableDebtDaysToP${percentileThreshold}MaturityData`);
    
    // Create Treasury service instance
    const treasuryService = new TreasuryService();
    
    // Check if we have existing data and get the latest timestamp
    const latestTimestamp = await getLatestTimestamp(db, metric.id);
    
    if (latestTimestamp) {
      // We have existing data, fetch only new data since the latest timestamp
      logger.info(`Found existing Days to P${percentileThreshold} Maturity data with latest timestamp: ${new Date(latestTimestamp * 1000).toISOString()}`);
      
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
      
      // Fetch debt expiration data for all record dates since startDate in a single API call
      logger.info(`Fetching debt expiration data from Treasury API since ${startDate}`);
      const allDebtData = await treasuryService.fetchMarketableDebtExpirationData(startDate);
      
      if (!allDebtData || Object.keys(allDebtData).length === 0) {
        logger.warn("No debt expiration data returned from Treasury API");
        return;
      }
      
      // Process each record date's data
      const newEntries: Emetric_TimeSeriesEntry[] = [];
      
      for (const recordDate of recordDates) {
        // Skip if this record date is not in the returned data
        if (!allDebtData[recordDate]) {
          logger.info(`No debt data available for record date: ${recordDate}`);
          continue;
        }
        
        logger.info(`Processing record date: ${recordDate}`);
        
        // Get debt data for this record date
        const debtData = allDebtData[recordDate];
        
        // Calculate days to percentile maturity
        const daysToPercentileMaturity = await calculateDaysToPercentileMaturity(
          recordDate, 
          debtData,
          percentileThreshold
        );
        
        if (daysToPercentileMaturity !== null) {
          logger.info(`Days to p${percentileThreshold} maturity for ${recordDate}: ${daysToPercentileMaturity}`);
          
          // Create time series entry
          newEntries.push({
            timestamp: Math.floor(new Date(recordDate).getTime() / 1000), // Convert to seconds
            value: daysToPercentileMaturity
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
      
      logger.info(`Successfully added ${newEntries.length} new Days to P${percentileThreshold} Maturity data points to existing ${existingEntries.length} points`);
    } else {
      // No existing data, fetch all data
      logger.info(`No existing Days to P${percentileThreshold} Maturity data found, fetching all available data`);
      
      // Fetch all available record dates
      logger.info("Fetching all available record dates from Treasury API");
      const recordDates = await treasuryService.fetchMarketableDebtRecordDates();
      
      if (recordDates.length === 0) {
        logger.warn("No record dates returned from Treasury API");
        return;
      }
      
      logger.info(`Found ${recordDates.length} record dates to process`);
      
      // Fetch all debt expiration data in a single API call
      logger.info("Fetching all debt expiration data from Treasury API");
      const allDebtData = await treasuryService.fetchMarketableDebtExpirationData("1900-01-01"); // Use a very old date to get all data
      
      if (!allDebtData || typeof allDebtData === 'object' && Object.keys(allDebtData).length === 0) {
        logger.warn("No debt expiration data returned from Treasury API");
        return;
      }
      
      // Process each record date's data
      const timeSeriesEntries: Emetric_TimeSeriesEntry[] = [];
      
      for (const recordDate of recordDates) {
        // Skip if this record date is not in the returned data
        if (!allDebtData[recordDate]) {
          logger.info(`No debt data available for record date: ${recordDate}`);
          continue;
        }
        
        logger.info(`Processing record date: ${recordDate}`);
        
        // Get debt data for this record date
        const debtData = allDebtData[recordDate];
        
        // Calculate days to percentile maturity
        const daysToPercentileMaturity = await calculateDaysToPercentileMaturity(
          recordDate, 
          debtData,
          percentileThreshold
        );
        
        if (daysToPercentileMaturity !== null) {
          logger.info(`Days to p${percentileThreshold} maturity for ${recordDate}: ${daysToPercentileMaturity}`);
          
          // Create time series entry
          timeSeriesEntries.push({
            timestamp: Math.floor(new Date(recordDate).getTime() / 1000), // Convert to seconds
            value: daysToPercentileMaturity
          });
        }
      }
      
      if (timeSeriesEntries.length === 0) {
        logger.warn(`No Days to P${percentileThreshold} Maturity data could be calculated`);
        return;
      }
      
      // Store time series data in Firestore
      const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metric.id);
      
      // Create or update the time series document
      await timeSeriesRef.set({
        id: metric.id,
        entries: timeSeriesEntries
      } as Emetric_TimeSeries);
      
      logger.info(`Successfully stored ${timeSeriesEntries.length} Days to P${percentileThreshold} Maturity data points`);
    }
  } catch (error) {
    logger.error(`Error on populateMarketableDebtDaysToP${percentileThreshold}MaturityData:`, error);
    throw error;
  }
};
