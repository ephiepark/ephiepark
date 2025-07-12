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
    id: "treasury_us_marketable_debt_avg_yield",
    name: "US Marketable Debt Average Yield",
    description: "Weighted average yield of outstanding marketable debt, weighted by issued amount",
    updateCycle: "daily",
    unit: "percent",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_total_marketable_debt",
    name: "US Total Marketable Debt",
    description: "Total outstanding marketable debt of the United States Treasury",
    updateCycle: "daily",
    unit: "billions of dollars",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_marketable_debt_bills",
    name: "US Marketable Debt - Bills",
    description: "Outstanding marketable debt of the United States Treasury in the Bills security class",
    updateCycle: "daily",
    unit: "billions of dollars",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_marketable_debt_notes",
    name: "US Marketable Debt - Notes",
    description: "Outstanding marketable debt of the United States Treasury in the Notes security class",
    updateCycle: "daily",
    unit: "billions of dollars",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_marketable_debt_bonds",
    name: "US Marketable Debt - Bonds",
    description: "Outstanding marketable debt of the United States Treasury in the Bonds security class",
    updateCycle: "daily",
    unit: "billions of dollars",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_marketable_debt_tips",
    name: "US Marketable Debt - TIPS",
    description: "Outstanding marketable debt of the United States Treasury in the Treasury Inflation-Protected Securities class",
    updateCycle: "daily",
    unit: "billions of dollars",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_marketable_debt_frn",
    name: "US Marketable Debt - Floating Rate Notes",
    description: "Outstanding marketable debt of the United States Treasury in the Floating Rate Notes security class",
    updateCycle: "daily",
    unit: "billions of dollars",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_marketable_debt_ffb",
    name: "US Marketable Debt - Federal Financing Bank",
    description: "Outstanding marketable debt of the United States Treasury in the Federal Financing Bank security class",
    updateCycle: "daily",
    unit: "billions of dollars",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_total_nonmarketable_debt",
    name: "US Total Nonmarketable Debt",
    description: "Total outstanding nonmarketable debt of the United States Treasury",
    updateCycle: "daily",
    unit: "billions of dollars",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_marketable_debt_maturity_percentile",
    name: "US Marketable Debt Maturity Percentile",
    description: "Percentage of total marketable debt that will mature by a given date",
    updateCycle: "daily",
    unit: "percent",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_marketable_debt_expiration_graph",
    name: "US Marketable Debt Expiration Graph",
    description: "Aggregated outstanding marketable debt amounts per maturity dates from Treasury MSPD data",
    updateCycle: "daily",
    unit: "billions of dollars",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "fred_us_gdp_data_id",
    name: "Gross Domestic Product",
    description: "The total value of goods produced and services provided in the United States",
    updateCycle: "daily",
    unit: "billions of dollars",
    metadata: {
      source: "FRED"
    }
  },
  {
    id: "fred_us_interest_payments_id",
    name: "Federal Interest Payments",
    description: "Federal government current expenditures on interest payments",
    updateCycle: "daily",
    unit: "billions of dollars",
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
  },
  {
    id: "treasury_treasury_bond_avg_interest_rates",
    name: "Treasury Bond Average Interest Rate",
    description: "Treasury Bond Average Interest Rate",
    updateCycle: "daily",
    unit: "percent",
    metadata: {
      source: "Treasury"
    } 
  },
  {
    id: "fred_us_federal_receipts_id",
    name: "Federal Government Receipts",
    description: "Total receipts of the United States federal government. Total government revenue.",
    updateCycle: "daily",
    unit: "billions of dollars",
    metadata: {
      source: "FRED"
    }
  },
  {
    id: "fred_us_federal_expenditures_id",
    name: "Federal Government Expenditures",
    description: "Total expenditures of the United States federal government. Total government spending.",
    updateCycle: "daily",
    unit: "billions of dollars",
    metadata: {
      source: "FRED"
    }
  },
  {
    id: "treasury_us_marketable_debt_days_to_p25_maturity",
    name: "Days to P25 Maturity of Marketable Debt",
    description: "Number of days until 25% of outstanding marketable debt matures from the record date",
    updateCycle: "daily",
    unit: "number of days",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_marketable_debt_days_to_p50_maturity",
    name: "Days to P50 Maturity of Marketable Debt",
    description: "Number of days until 50% of outstanding marketable debt matures from the record date",
    updateCycle: "daily",
    unit: "number of days",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_marketable_debt_days_to_p75_maturity",
    name: "Days to P75 Maturity of Marketable Debt",
    description: "Number of days until 75% of outstanding marketable debt matures from the record date",
    updateCycle: "daily",
    unit: "number of days",
    metadata: {
      source: "Treasury"
    }
  },
  {
    id: "treasury_us_marketable_debt_days_to_p90_maturity",
    name: "Days to P90 Maturity of Marketable Debt",
    description: "Number of days until 90% of outstanding marketable debt matures from the record date",
    updateCycle: "daily",
    unit: "number of days",
    metadata: {
      source: "Treasury"
    }
  },
];
