import { Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { 
  EMETRIC_TIMESERIES_COLLECTION,
  Emetric_Metric,
  Emetric_TimeSeries, 
  Emetric_TimeSeriesEntry 
} from "../../shared/types.js";
import { getExistingEntries } from "../../shared/emetric/utils.js";

/**
 * Calculates and populates the debt maturity percentile data
 * This metric shows what percentage of total marketable debt will mature by a given date
 * 
 * @param db - Firestore database instance
 * @param metric - The metric definition
 */
export const asyncPopulateMarketableDebtMaturityPercentileData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  try {
    logger.info("Starting asyncPopulateDebtMaturityPercentileData");
    
    // Get the source debt expiration data
    const sourceMetricId = "treasury_us_marketable_debt_expiration_graph";
    const sourceEntries = await getExistingEntries(db, sourceMetricId);
    
    if (sourceEntries.length === 0) {
      logger.warn(`No data found for source metric: ${sourceMetricId}`);
      return;
    }
    
    logger.info(`Found ${sourceEntries.length} entries for source metric: ${sourceMetricId}`);
    
    // Sort entries by timestamp (maturity date)
    const sortedEntries = [...sourceEntries].sort((a, b) => a.timestamp - b.timestamp);
    
    // Calculate total outstanding debt
    const totalDebt = sortedEntries.reduce((sum, entry) => sum + entry.value, 0);
    
    if (totalDebt <= 0) {
      logger.warn("Total debt is zero or negative, cannot calculate percentiles");
      return;
    }
    
    logger.info(`Total outstanding debt: ${totalDebt} billions of dollars`);
    
    // Calculate cumulative debt and percentiles
    let cumulativeDebt = 0;
    const percentileEntries: Emetric_TimeSeriesEntry[] = [];
    
    for (const entry of sortedEntries) {
      cumulativeDebt += entry.value;
      const percentile = (cumulativeDebt * 1.0 / totalDebt) * 100;
      
      percentileEntries.push({
        timestamp: entry.timestamp,
        value: percentile
      });
    }
    
    // Store the percentile data in Firestore
    const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metric.id);
    
    await timeSeriesRef.set({
      id: metric.id,
      entries: percentileEntries
    } as Emetric_TimeSeries);
    
    logger.info(`Successfully stored ${percentileEntries.length} debt maturity percentile data points`);
  } catch (error) {
    logger.error("Error on asyncPopulateDebtMaturityPercentileData:", error);
    throw error;
  }
};
