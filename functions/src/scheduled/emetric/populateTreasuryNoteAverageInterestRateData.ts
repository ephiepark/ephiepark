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


export const asyncPopulateTreasuryNoteAverageInterestRateData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  try {
    logger.info("Starting asyncPopulateTreasuryNoteAverageInterestRateData");
    
    // Create Treasury service instance
    const treasuryService = new TreasuryService();
    
    // Check if we have existing data and get the latest timestamp
    const latestTimestamp = await getLatestTimestamp(db, metric.id);
    
    if (latestTimestamp) {
      // We have existing data, fetch only new data since the latest timestamp
      logger.info(`Found existing Treasury Note data with latest timestamp: ${new Date(latestTimestamp * 1000).toISOString()}`);
      
      // Get existing entries
      const existingEntries = await getExistingEntries(db, metric.id);
      
      // Convert timestamp to date string for API (add 1 second to avoid duplicates)
      const startDate = new Date((latestTimestamp + 1) * 1000).toISOString().split('T')[0];
      
      // Fetch only new data since the latest timestamp
      logger.info(`Fetching Treasury Note data from Treasury API since ${startDate}`);
      const noteData = await treasuryService.fetchTreasuryNoteAvgInterestRateData(startDate);
      
      if (noteData.length === 0) {
        logger.info("No new Treasury Note data available since last update");
        return;
      }
      
      // Transform new data to Emetric format
      const newEntries: Emetric_TimeSeriesEntry[] = noteData.map(item => ({
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
      
      logger.info(`Successfully added ${newEntries.length} new Treasury Note data points to existing ${existingEntries.length} points`);
    } else {
      // No existing data, fetch all data as before
      logger.info("No existing Treasury Note data found, fetching all available data");
      
      // Fetch Treasury Note data
      logger.info("Fetching Treasury Note data from Treasury API");
      const noteData = await treasuryService.fetchTreasuryNoteAvgInterestRateData();
      
      if (noteData.length === 0) {
        logger.warn("No Treasury Note data returned from Treasury API");
        return;
      }
      
      // Transform data to Emetric format
      const timeSeriesEntries: Emetric_TimeSeriesEntry[] = noteData.map(item => ({
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
      
      logger.info(`Successfully stored ${timeSeriesEntries.length} Treasury Note data points`);
    }
  } catch (error) {
    logger.error("Error on asyncPopulateTreasuryNoteAverageInterestRateData:", error);
    throw error;
  }
};
