import { Emetric_Metric } from "../types.js";

export const getMetricById = (id: string): Emetric_Metric | null => {
  const ret = metricRegistry.find(metric => metric.id === id);
  if (ret === null || ret === undefined) {
    return null;
  }
  return ret;
};

// Make sure to update metricBuilderRegistry as well
export const metricRegistry: Array<Emetric_Metric> = [
  {
    id: "fred_us_gdp_data_id",
    name: "Gross Domestic Product",
    description: "The total value of goods produced and services provided in the United States",
    updateCycle: "daily",
    unit: "dollar",
    metadata: {
      source: "FRED"
    }
  },
  {
    id: "fred_us_debt_gdp_ratio_id",
    name: "Federal Debt to GDP Ratio",
    description: "Ratio of federal debt held by the public to Gross Domestic Product",
    updateCycle: "daily",
    unit: "percent",
    metadata: {
      source: "FRED"
    }
  }
];