
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

const FRED_API_KEY = "9a76767a206fcd5664b94fe515d67260";

const DEBT_GDP_RATIO_METRIC: FredMetric = {
  sourceKey: "GFDEGDQ188S", // FRED series ID for Federal Debt to GDP
};

export const asyncPopulateDebtGDPData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  try {
    logger.info("Starting Debt to GDP ratio data population");
    
    const fredService = new FredService(FRED_API_KEY);
    
    // Check if we have existing data and get the latest timestamp
    const latestTimestamp = await getLatestTimestamp(db, metric.id);
    
    if (latestTimestamp) {
      // We have existing data, fetch only new data since the latest timestamp
      logger.info(`Found existing Debt to GDP ratio data with latest timestamp: ${new Date(latestTimestamp * 1000).toISOString()}`);
      
      // Get existing entries
      const existingEntries = await getExistingEntries(db, metric.id);
      
      // Convert timestamp to date string for API (add 1 second to avoid duplicates)
      const startDate = new Date((latestTimestamp + 1) * 1000).toISOString().split('T')[0];
      
      // Fetch only new data since the latest timestamp
      logger.info(`Fetching Debt to GDP ratio data from FRED since ${startDate}`);
      const debtGDPData = await fredService.fetchMetricData(DEBT_GDP_RATIO_METRIC, startDate);
      
      if (debtGDPData.length === 0) {
        logger.info("No new Debt to GDP ratio data available since last update");
        return;
      }
      
      // Transform new data to Emetric format
      const newEntries: Emetric_TimeSeriesEntry[] = debtGDPData.map(item => ({
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
      
      logger.info(`Successfully added ${newEntries.length} new Debt to GDP ratio data points to existing ${existingEntries.length} points`);
    } else {
      // No existing data, fetch all data as before
      logger.info("No existing Debt to GDP ratio data found, fetching all available data");
      
      logger.info("Fetching Debt to GDP ratio data from FRED");
      const debtGDPData = await fredService.fetchMetricData(DEBT_GDP_RATIO_METRIC);
      
      if (debtGDPData.length === 0) {
        logger.warn("No Debt to GDP ratio data returned from FRED");
        return;
      }
      
      const timeSeriesEntries: Emetric_TimeSeriesEntry[] = debtGDPData.map(item => ({
        timestamp: Math.floor(item.timestamp / 1000),
        value: item.value
      }));
      
      const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metric.id);
      
      await timeSeriesRef.set({
        id: metric.id,
        entries: timeSeriesEntries
      } as Emetric_TimeSeries);
      
      logger.info(`Successfully stored ${timeSeriesEntries.length} Debt to GDP ratio data points`);
    }
  } catch (error) {
    logger.error("Error populating Debt to GDP ratio data:", error);
    throw error;
  }
};
