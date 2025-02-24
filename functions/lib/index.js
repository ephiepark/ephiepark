import { onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import FredService from "./services/fredService.js";
initializeApp();
const db = getFirestore();
// Collections
const METRICS_COLLECTION = "emetric_metrics";
const SOURCES_COLLECTION = "emetric_sources";
const DATA_COLLECTION = "emetric_data";
const PREFERENCES_COLLECTION = "emetric_user_preferences";
// Get metrics
export const getMetrics = onCall(async (request) => {
    if (!request.auth) {
        throw new Error("Must be logged in");
    }
    const snapshot = await db.collection(METRICS_COLLECTION).get();
    return snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
});
// Get data sources
export const getDataSources = onCall(async (request) => {
    if (!request.auth) {
        throw new Error("Must be logged in");
    }
    const snapshot = await db.collection(SOURCES_COLLECTION).get();
    return snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
});
// Get user preferences
export const getUserPreferences = onCall(async (request) => {
    if (!request.auth) {
        throw new Error("Must be logged in");
    }
    const { userId } = request.data;
    if (userId !== request.auth.uid) {
        throw new Error("Can only access own preferences");
    }
    const doc = await db.collection(PREFERENCES_COLLECTION).doc(userId).get();
    return doc.exists ? doc.data() : null;
});
// Update metric data (scheduled function)
export const updateMetricData = onSchedule("0 0 * * *", async () => {
    const metricsSnapshot = await db.collection(METRICS_COLLECTION).get();
    const sourcesSnapshot = await db.collection(SOURCES_COLLECTION).get();
    const sources = new Map();
    sourcesSnapshot.docs.forEach((doc) => {
        sources.set(doc.id, Object.assign({ id: doc.id }, doc.data()));
    });
    const batch = db.batch();
    const timestamp = Date.now();
    for (const metricDoc of metricsSnapshot.docs) {
        const metric = Object.assign({ id: metricDoc.id }, metricDoc.data());
        const source = sources.get(metric.sourceId);
        if (!source || !source.enabled) {
            console.log(`Skipping metric ${metric.id}: source not found or disabled`);
            continue;
        }
        try {
            switch (source.type) {
                case "fred": {
                    const fredService = new FredService(source.config.apiKey);
                    const data = await fredService.fetchMetricData(metric);
                    // Store only the latest data point
                    const latestData = data[data.length - 1];
                    if (latestData) {
                        const docRef = db.collection(DATA_COLLECTION).doc();
                        batch.set(docRef, Object.assign(Object.assign({}, latestData), { timestamp }));
                    }
                    break;
                }
                default:
                    console.log(`Unsupported source type: ${source.type}`);
            }
        }
        catch (error) {
            console.error(`Error updating metric ${metric.id}:`, error);
        }
    }
    await batch.commit();
    console.log("Metric data update completed");
});
//# sourceMappingURL=index.js.map