import { Firestore } from "firebase-admin/firestore";
import { Emetric_Metric } from "../../shared/types.js";
import { populateMarketableDebtDaysToPercentileMaturityData } from "./populateMarketableDebtDaysToPercentileMaturityData.js";

/**
 * Calculates and populates the days to p75 maturity data
 * This metric shows how many days until 75% of the outstanding marketable debt matures from the record date
 * 
 * @param db - Firestore database instance
 * @param metric - The metric definition
 */
export const asyncPopulateMarketableDebtDaysToP75MaturityData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  // Use the generic implementation with percentile threshold set to 75
  return populateMarketableDebtDaysToPercentileMaturityData(db, metric, 75);
};
