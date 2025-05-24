import { Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { EMETRIC_TIMESERIES_COLLECTION, Emetric_TimeSeriesEntry } from "../types.js";

/**
 * Gets the latest timestamp from existing metric data in Firestore
 * @param db - Firestore database instance
 * @param metricId - The ID of the metric to check
 * @return The latest timestamp (in seconds) or null if no data exists
 */
export async function getLatestTimestamp(db: Firestore, metricId: string): Promise<number | null> {
  try {
    const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metricId);
    const doc = await timeSeriesRef.get();
    
    if (!doc.exists || !doc.data()?.entries?.length) {
      logger.info(`No existing data found for metric: ${metricId}`);
      return null; // No existing data
    }
    
    const entries = doc.data()?.entries as Emetric_TimeSeriesEntry[];
    // Sort entries by timestamp in descending order and get the latest
    const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
    const latestTimestamp = sortedEntries[0]?.timestamp || null;
    
    if (latestTimestamp) {
      logger.info(`Latest timestamp for metric ${metricId}: ${new Date(latestTimestamp * 1000).toISOString()}`);
    }
    
    return latestTimestamp;
  } catch (error) {
    logger.error(`Error getting latest timestamp for metric ${metricId}:`, error);
    return null;
  }
}

/**
 * Gets existing time series entries for a metric from Firestore
 * @param db - Firestore database instance
 * @param metricId - The ID of the metric to get entries for
 * @return Array of existing time series entries or empty array if none exist
 */
export async function getExistingEntries(db: Firestore, metricId: string): Promise<Emetric_TimeSeriesEntry[]> {
  try {
    const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metricId);
    const doc = await timeSeriesRef.get();
    
    if (!doc.exists || !doc.data()?.entries?.length) {
      return []; // No existing entries
    }
    
    return doc.data()?.entries as Emetric_TimeSeriesEntry[];
  } catch (error) {
    logger.error(`Error getting existing entries for metric ${metricId}:`, error);
    return [];
  }
}
