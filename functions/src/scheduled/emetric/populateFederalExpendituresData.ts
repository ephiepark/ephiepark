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

// Federal Expenditures metric definition
const FEDERAL_EXPENDITURES_METRIC: FredMetric = {
  sourceKey: "FGEXPND", // FRED series ID for Federal Government Expenditures
  frequency: "quarterly"
};

/**
 * Fetches Federal Government Expenditures data from FRED and stores it in Firestore
 * @param db - Firestore database instance
 * @param metric - Metric configuration
 */
export const asyncPopulateFederalExpendituresData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  try {
    logger.info("Starting Federal Government Expenditures data population");

    // Create FRED service instance
    const fredService = new FredService(FRED_API_KEY);

    // Fetch Federal Expenditures data from FRED
    logger.info("Fetching Federal Government Expenditures data from FRED");
    const expendituresData = await fredService.fetchMetricData(FEDERAL_EXPENDITURES_METRIC);

    if (expendituresData.length === 0) {
      logger.warn("No Federal Government Expenditures data returned from FRED");
      return;
    }

    // Transform data to Emetric format
    const timeSeriesEntries: Emetric_TimeSeriesEntry[] = expendituresData.map(item => ({
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

    logger.info(`Successfully stored ${timeSeriesEntries.length} Federal Government Expenditures data points`);
  } catch (error) {
    logger.error("Error populating Federal Government Expenditures data:", error);
    throw error;
  }
};
