import { Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { TreasuryService } from "../../services/treasuryService.js";
import { 
  EMETRIC_TIMESERIES_COLLECTION,
  Emetric_Metric,
  Emetric_TimeSeries, 
  Emetric_TimeSeriesEntry 
} from "../../shared/types.js";


export const asyncPopulateTreasuryBondAverageInterestRateData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  try {
    logger.info("Starting asyncPopulateTreasuryBondAverageInterestRateData");
    
    // Create Treasury service instance
    const treasuryService = new TreasuryService();

    // Fetch Treasury Bond data
    logger.info("Fetching Treasury Bond data from Treasury API");
    const bondData = await treasuryService.fetchTreasuryBondAvgInterestRateData();

    if (bondData.length === 0) {
      logger.warn("No Treasury Bond data returned from Treasury API");
      return;
    }

    // Transform data to Emetric format
    const timeSeriesEntries: Emetric_TimeSeriesEntry[] = bondData.map(item => ({
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

    logger.info(`Successfully stored ${timeSeriesEntries.length} Treasury Bond data points`);
  } catch (error) {
    logger.error("Error on asyncPopulateTreasuryBondAverageInterestRateData:", error);
    throw error;
  }
};
