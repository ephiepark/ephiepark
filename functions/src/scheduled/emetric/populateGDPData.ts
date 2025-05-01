import { Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { FredService, FredMetric } from "../../services/fredService.js";
import { 
  EMETRIC_METRICS_COLLECTION,
  EMETRIC_TIMESERIES_COLLECTION,
  Emetric_Metric, 
  Emetric_TimeSeries, 
  Emetric_TimeSeriesEntry 
} from "../../../../shared/types.js";

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
export const asyncPopulateGDPData = async (db: Firestore): Promise<void> => {
  try {
    logger.info("Starting GDP data population");

    const metricId = 'fred_us_gdp_data_id';

    // Create FRED service instance
    const fredService = new FredService(FRED_API_KEY);

    // Check if GDP metric exists in Firestore, create if not
    const metricRef = db.collection(EMETRIC_METRICS_COLLECTION).doc(metricId);
    const metricDoc = await metricRef.get();
 
    if (!metricDoc.exists) {
      // Create the metric document
      const gdpMetric: Emetric_Metric = {
        id: metricId,
        name: "Gross Domestic Product",
        description: "The total value of goods produced and services provided in the United States",
        updateCycle: "quarterly",
        unit: "dollar",
        metadata: {
          source: "FRED"
        }
      };

      await metricRef.set(gdpMetric);
      logger.info("Created GDP metric document");
    } 

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
    const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metricId);
    
    // Create or update the time series document
    await timeSeriesRef.set({
      id: metricId,
      entries: timeSeriesEntries
    } as Emetric_TimeSeries);

    logger.info(`Successfully stored ${timeSeriesEntries.length} GDP data points`);
  } catch (error) {
    logger.error("Error populating GDP data:", error);
    throw error;
  }
};
