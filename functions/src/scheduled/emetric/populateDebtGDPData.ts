
import { Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { FredService, FredMetric } from "../../services/fredService.js";
import { 
  EMETRIC_TIMESERIES_COLLECTION,
  Emetric_Metric,
  Emetric_TimeSeries, 
  Emetric_TimeSeriesEntry 
} from "../../shared/types.js";

const FRED_API_KEY = "9a76767a206fcd5664b94fe515d67260";

const DEBT_GDP_RATIO_METRIC: FredMetric = {
  id: "fred_us_debt_gdp_ratio_id",
  sourceKey: "GFDEGDQ188S", // FRED series ID for Federal Debt to GDP
  frequency: "quarterly"
};

export const asyncPopulateDebtGDPData = async (db: Firestore, metric: Emetric_Metric): Promise<void> => {
  try {
    logger.info("Starting Debt to GDP ratio data population");
    
    const fredService = new FredService(FRED_API_KEY);
    
    logger.info("Fetching Debt to GDP ratio data from FRED");
    const debtGDPData = await fredService.fetchMetricData(DEBT_GDP_RATIO_METRIC);

    if (debtGDPData.length === 0) {
      logger.warn("No Debt to GDP ratio data returned from FRED");
      return;
    }

    const timeSeriesEntries: Emetric_TimeSeriesEntry[] = debtGDPData.map(item => ({
      timestamp: Math.floor(item.timestamp / 1000),
      value: item.value
    }));

    const timeSeriesRef = db.collection(EMETRIC_TIMESERIES_COLLECTION).doc(metric.id);
    
    await timeSeriesRef.set({
      id: metric.id,
      entries: timeSeriesEntries
    } as Emetric_TimeSeries);

    logger.info(`Successfully stored ${timeSeriesEntries.length} Debt to GDP ratio data points`);
  } catch (error) {
    logger.error("Error populating Debt to GDP ratio data:", error);
    throw error;
  }
};
