import { Firestore } from "node_modules/firebase-admin/lib/firestore/index.js";
import { Emetric_Metric } from "../../shared/types.js";
import { asyncPopulateGDPData } from "./populateGDPData.js";

export const metricBuilderRegistry: Record<string, (db: Firestore, metric: Emetric_Metric) => Promise<void>> = {
  'fred_us_gdp_data_id': asyncPopulateGDPData,
};