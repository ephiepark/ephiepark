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
  } catch (error) {
    logger.error("Error populating Federal Interest Payments data:", error);
    throw error;
  }
};
