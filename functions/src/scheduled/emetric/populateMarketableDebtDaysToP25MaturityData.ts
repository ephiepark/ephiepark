import { Firestore } from "firebase-admin/firestore";
import { Emetric_Metric } from "../../shared/types.js";
import { populateMarketableDebtDaysToPercentileMaturityData } from "./populateMarketableDebtDaysToPercentileMaturityData.js";

/**
 * Calculates and populates the days to p25 maturity data
 * This metric shows how many days until 25% of the outstanding marketable debt matures from the record date
 * 
 * @param db - Firestore database instance
 * @param metric - The metric definition
 */
export const asyncPopulateMarketableDebtDaysToP25MaturityData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  // Use the generic implementation with percentile threshold set to 25
  return populateMarketableDebtDaysToPercentileMaturityData(db, metric, 25);
};
