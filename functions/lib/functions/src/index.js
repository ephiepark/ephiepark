import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { asyncPopulateGDPData } from "./scheduled/emetric/populateGDPData.js";
// Initialize Firebase
initializeApp();
// Export scheduled functions
export { populateDailyEmetricData } from "./scheduled/emetric/populateEmetricData.js";
/**
 * HTTP function to manually trigger the emetric data population
 * This can be used for testing the populateDailyEmetricData functionality
 *
 * Local testing:
 * 1. Run: firebase emulators:start --only functions
 * 2. Call: http://localhost:5001/YOUR_PROJECT_ID/us-central1/triggerEmetricDataPopulation
 */
export const triggerEmetricDataPopulation = onRequest(async (req, res) => {
    try {
        logger.info("Manually triggering emetric data population job");
        const db = getFirestore();
        await asyncPopulateGDPData(db);
        logger.info("Emetric data population job completed successfully");
        res.status(200).send("Emetric data population completed successfully");
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("Error in emetric data population job:", error);
        res.status(500).send(`Error: ${errorMessage}`);
    }
});
//# sourceMappingURL=index.js.map