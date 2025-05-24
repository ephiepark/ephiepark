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

// Federal Receipts metric definition
const FEDERAL_RECEIPTS_METRIC: FredMetric = {
  sourceKey: "FGRECPT", // FRED series ID for Federal Government Receipts
  frequency: "quarterly"
};

/**
 * Fetches Federal Government Receipts data from FRED and stores it in Firestore
 * @param db - Firestore database instance
 * @param metric - Metric configuration
 */
export const asyncPopulateFederalReceiptsData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  try {
    logger.info("Starting Federal Government Receipts data population");

    // Create FRED service instance
    const fredService = new FredService(FRED_API_KEY);
    
    // Check if we have existing data and get the latest timestamp
    const latestTimestamp = await getLatestTimestamp(db, metric.id);
    
    if (latestTimestamp) {
      // We have existing data, fetch only new data since the latest timestamp
      logger.info(`Found existing Federal Receipts data with latest timestamp: ${new Date(latestTimestamp * 1000).toISOString()}`);
      
      // Get existing entries
      const existingEntries = await getExistingEntries(db, metric.id);
      
      // Convert timestamp to date string for API (add 1 second to avoid duplicates)
      const startDate = new Date((latestTimestamp + 1) * 1000).toISOString().split('T')[0];
      
      // Fetch only new data since the latest timestamp
      logger.info(`Fetching Federal Government Receipts data from FRED since ${startDate}`);
      const receiptsData = await fredService.fetchMetricData(FEDERAL_RECEIPTS_METRIC, startDate);
      
      if (receiptsData.length === 0) {
        logger.info("No new Federal Government Receipts data available since last update");
        return;
      }
      
      // Transform new data to Emetric format
      const newEntries: Emetric_TimeSeriesEntry[] = receiptsData.map(item => ({
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
      
      logger.info(`Successfully added ${newEntries.length} new Federal Government Receipts data points to existing ${existingEntries.length} points`);
    } else {
      // No existing data, fetch all data as before
      logger.info("No existing Federal Government Receipts data found, fetching all available data");
      
      // Fetch Federal Receipts data from FRED
      logger.info("Fetching Federal Government Receipts data from FRED");
      const receiptsData = await fredService.fetchMetricData(FEDERAL_RECEIPTS_METRIC);
      
      if (receiptsData.length === 0) {
        logger.warn("No Federal Government Receipts data returned from FRED");
        return;
      }
      
      // Transform data to Emetric format
      const timeSeriesEntries: Emetric_TimeSeriesEntry[] = receiptsData.map(item => ({
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
      
      logger.info(`Successfully stored ${timeSeriesEntries.length} Federal Government Receipts data points`);
    }
  } catch (error) {
    logger.error("Error populating Federal Government Receipts data:", error);
    throw error;
  }
};
