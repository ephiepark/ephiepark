import { Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { FredService, FredMetric } from "../../services/fredService.js";
import { 
  EMETRIC_TIMESERIES_COLLECTION,
  Emetric_Metric,
  Emetric_TimeSeries, 
  Emetric_TimeSeriesEntry 
} from "../../shared/types.js";

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
  } catch (error) {
    logger.error("Error populating Federal Government Receipts data:", error);
    throw error;
  }
};
