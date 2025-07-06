import { logger } from "firebase-functions";
import { TreasuryService } from "../../services/treasuryService.js";

/**
 * Calculates the number of days between two dates
 * @param date1 - The first date
 * @param date2 - The second date
 * @returns The number of days between the two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  // Convert both dates to milliseconds since epoch
  const date1Ms = date1.getTime();
  const date2Ms = date2.getTime();
  
  // Calculate the difference in milliseconds
  const differenceMs = Math.abs(date2Ms - date1Ms);
  
  // Convert milliseconds to days
  return Math.round(differenceMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates days to a specific percentile maturity for a given record date
 * @param recordDate - The record date in YYYY-MM-DD format
 * @param debtData - The debt expiration data
 * @param percentileThreshold - The percentile threshold (e.g., 25, 50, 75, 90)
 * @returns The number of days to the specified percentile maturity or null if it cannot be calculated
 */
export async function calculateDaysToPercentileMaturity(
  recordDate: string, 
  debtData: TreasuryService['fetchMarketableDebtExpirationData'] extends (...args: any[]) => Promise<infer R> ? R : never,
  percentileThreshold: number
): Promise<number | null> {
  if (debtData.length === 0) {
    logger.warn(`No debt expiration data for record date: ${recordDate}`);
    return null;
  }
  
  // Sort entries by timestamp (maturity date)
  const sortedEntries = [...debtData].sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate total outstanding debt
  const totalDebt = sortedEntries.reduce((sum, entry) => sum + entry.value, 0);
  
  if (totalDebt <= 0) {
    logger.warn(`Total debt is zero or negative for record date: ${recordDate}`);
    return null;
  }
  
  // Calculate cumulative debt and find percentile maturity date
  let cumulativeDebt = 0;
  let percentileMaturityDate: Date | null = null;
  const recordDateObj = new Date(recordDate);
  
  for (const entry of sortedEntries) {
    cumulativeDebt += entry.value;
    const percentile = (cumulativeDebt * 1.0 / totalDebt) * 100;
    
    // If we've reached or exceeded the percentile threshold, and haven't found the date yet
    if (percentile >= percentileThreshold && percentileMaturityDate === null) {
      percentileMaturityDate = new Date(entry.timestamp);
      break;
    }
  }
  
  if (!percentileMaturityDate) {
    logger.warn(`Could not determine p${percentileThreshold} maturity date for record date: ${recordDate}`);
    return null;
  }
  
  // Calculate days between record date and percentile maturity date
  return daysBetween(recordDateObj, percentileMaturityDate);
}
