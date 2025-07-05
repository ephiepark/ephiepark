import { initializeApp } from "firebase-admin/app";
// import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
// import { asyncPopulateGDPData } from "./scheduled/emetric/populateGDPData.js";
import { calculateDerivedMetrics } from "./scheduled/emetric/populateDerivedMetricData.js";

// Initialize Firebase
initializeApp();

// Export scheduled functions
export { populateDailyEmetricData } from "./scheduled/emetric/populateEmetricData.js";

// Listen for new derived time series definitions and recalculate metrics
export const onNewDerivedTimeSeriesDefinition = onDocumentCreated(
  "emetric_derived_timeseries_definitions/{definitionId}",
  async (event) => {
    try {
      logger.info("New derived time series definition detected", { 
        definitionId: event.params.definitionId,
        time: new Date().toISOString() 
      });

      const db = getFirestore();
      
      // Recalculate all derived metrics
      logger.info("Starting derived metric calculation due to new definition");
      await calculateDerivedMetrics(db);
      
      logger.info("Derived metrics calculation completed successfully");
      return;
    } catch (error) {
      logger.error("Error in derived metrics calculation triggered by new definition:", error);
      throw error;
    }
  }
);
