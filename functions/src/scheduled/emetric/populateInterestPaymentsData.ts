import { Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { FredService, FredMetric } from "../../services/fredService.js";
import { 
  EMETRIC_TIMESERIES_COLLECTION,
  Emetric_Metric,
  Emetric_TimeSeries, 
  Emetric_TimeSeriesEntry 
} from "../../shared/types.js";
import { getLatestTimestamp, getExistingEntries } from "../../shared/emetric/utils.js";

// Configuration
const FRED_API_KEY = "9a76767a206fcd5664b94fe515d67260";

// Interest Payments metric definition
const INTEREST_PAYMENTS_METRIC: FredMetric = {
  sourceKey: "A091RC1Q027SBEA", // FRED series ID for Federal government current expenditures: Interest payments
  frequency: "quarterly"
};

/**
 * Fetches Federal Interest Payments data from FRED and stores it in Firestore
 * @param db - Firestore database instance
 * @param metric - The metric definition
 */
export const asyncPopulateInterestPaymentsData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  try {
    logger.info("Starting Federal Interest Payments data population");

    // Create FRED service instance
    const fredService = new FredService(FRED_API_KEY);
    
    // Check if we have existing data and get the latest timestamp
    const latestTimestamp = await getLatestTimestamp(db, metric.id);
    
    if (latestTimestamp) {
      // We have existing data, fetch only new data since the latest timestamp
      logger.info(`Found existing Interest Payments data with latest timestamp: ${new Date(latestTimestamp * 1000).toISOString()}`);
      
      // Get existing entries
      const existingEntries = await getExistingEntries(db, metric.id);
      
      // Convert timestamp to date string for API (add 1 second to avoid duplicates)
      const startDate = new Date((latestTimestamp + 1) * 1000).toISOString().split('T')[0];
      
      // Fetch only new data since the latest timestamp
      logger.info(`Fetching Federal Interest Payments data from FRED since ${startDate}`);
      const interestPaymentsData = await fredService.fetchMetricData(INTEREST_PAYMENTS_METRIC, startDate);
      
      if (interestPaymentsData.length === 0) {
        logger.info("No new Federal Interest Payments data available since last update");
        return;
      }
      
      // Transform new data to Emetric format
      const newEntries: Emetric_TimeSeriesEntry[] = interestPaymentsData.map(item => ({
        timestamp: Math.floor(item.timestamp / 1000),
        value: item.value
      }));
      
      // Combine existing and new entries
      const combinedEntries = [...existingEntries, ...newEntries];
      
      // Store combined time series data in Firestore
      const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metric.id);
      await timeSeriesRef.set({
        id: metric.id,
        entries: combinedEntries
      } as Emetric_TimeSeries);
      
      logger.info(`Successfully added ${newEntries.length} new Federal Interest Payments data points to existing ${existingEntries.length} points`);
    } else {
      // No existing data, fetch all data as before
      logger.info("No existing Federal Interest Payments data found, fetching all available data");
      
      // Fetch Interest Payments data from FRED
      logger.info("Fetching Federal Interest Payments data from FRED");
      const interestPaymentsData = await fredService.fetchMetricData(INTEREST_PAYMENTS_METRIC);
      
      if (interestPaymentsData.length === 0) {
        logger.warn("No Federal Interest Payments data returned from FRED");
        return;
      }
      
      // Transform data to Emetric format
      const timeSeriesEntries: Emetric_TimeSeriesEntry[] = interestPaymentsData.map(item => ({
        timestamp: Math.floor(item.timestamp / 1000),
        value: item.value,
      }));
      
      // Store time series data in Firestore
      const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metric.id);
      
      // Create or update the time series document
      await timeSeriesRef.set({
        id: metric.id,
        entries: timeSeriesEntries
      } as Emetric_TimeSeries);
      
      logger.info(`Successfully stored ${timeSeriesEntries.length} Federal Interest Payments data points`);
    }
  } catch (error) {
    logger.error("Error populating Federal Interest Payments data:", error);
    throw error;
  }
};
