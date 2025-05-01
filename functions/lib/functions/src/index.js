import { initializeApp } from "firebase-admin/app";
// import { onRequest } from "firebase-functions/v2/https";
// import { getFirestore } from "firebase-admin/firestore";
// import { logger } from "firebase-functions";
// import { asyncPopulateGDPData } from "./scheduled/emetric/populateGDPData.js";
// Initialize Firebase
initializeApp();
// Export scheduled functions
export { populateDailyEmetricData } from "./scheduled/emetric/populateEmetricData.js";
//# sourceMappingURL=index.js.map