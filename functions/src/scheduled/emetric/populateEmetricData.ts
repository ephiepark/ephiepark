import { onSchedule, ScheduledEvent } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { metricRegistry } from "../../shared/emetric/metricRegistry.js";
import { metricBuilderRegistry } from "./metricBuilderRegistry.js";
import { calculateDerivedMetrics } from "./populateDerivedMetricData.js";

/**
 * Scheduled function that runs daily to update emetric data
 */
export const populateDailyEmetricData = onSchedule({
  schedule: "0 0 * * *", // Run at midnight every day (cron syntax)
  timeZone: "America/New_York", // Eastern Time
  retryCount: 3, // Retry up to 3 times if the function fails
  memory: "256MiB",
}, async (event: ScheduledEvent) => {
  try {
    logger.info("Starting emetric data population job", { time: new Date().toISOString() });

    const db = getFirestore();
    const dailyMetricList = metricRegistry.filter(metric => metric.updateCycle === 'daily');
    logger.info("Metric registry / Daily Metric List", metricRegistry, dailyMetricList);
    const awaitables = dailyMetricList.map(async (metric) => {
      logger.info("Process metric id", metric.id, metric);
      if (metric.id in metricBuilderRegistry) {
        const asyncMetricBuilder = metricBuilderRegistry[metric.id];
        await asyncMetricBuilder(db, metric);
      }
    });
    await Promise.all(awaitables);

    // Calculate derived metric values
    logger.info("Starting derived metric calculation");
    await calculateDerivedMetrics(db);
    
    logger.info("Emetric daily data population job completed successfully");
    return;
  } catch (error) {
    logger.error("Error in emetric daily data population job:", error);
    throw error; // Rethrowing will trigger the retry mechanism
  }
});
