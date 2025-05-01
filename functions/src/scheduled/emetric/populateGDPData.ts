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

// GDP metric definition
const GDP_METRIC: FredMetric = {
  id: "gdp",
  sourceKey: "GDP", // FRED series ID for Gross Domestic Product
  frequency: "quarterly"
};

/**
 * Fetches GDP data from FRED and stores it in Firestore
 * @param db - Firestore database instance
 */
export const asyncPopulateGDPData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  try {
    logger.info("Starting GDP data population");

    // Create FRED service instance
    const fredService = new FredService(FRED_API_KEY);

    // Fetch GDP data from FRED
    logger.info("Fetching GDP data from FRED");
    const gdpData = await fredService.fetchMetricData(GDP_METRIC);

    if (gdpData.length === 0) {
      logger.warn("No GDP data returned from FRED");
      return;
    }

    // Transform data to Emetric format
    const timeSeriesEntries: Emetric_TimeSeriesEntry[] = gdpData.map(item => ({
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

    logger.info(`Successfully stored ${timeSeriesEntries.length} GDP data points`);
  } catch (error) {
    logger.error("Error populating GDP data:", error);
    throw error;
  }
};
