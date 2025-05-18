import { Firestore } from "node_modules/firebase-admin/lib/firestore/index.js";
import { Emetric_Metric } from "../../shared/types.js";
import { asyncPopulateGDPData } from "./populateGDPData.js";
import { asyncPopulateDebtGDPData } from "./populateDebtGDPData.js";
import { asyncPopulateTreasuryBondAverageInterestRateData } from "./populateTreasuryBondAverageInterestRateData.js";
import { asyncPopulateFederalReceiptsData } from "./populateFederalReceiptsData.js";
import { asyncPopulateFederalExpendituresData } from "./populateFederalExpendituresData.js";
import { asyncPopulateInterestPaymentsData } from "./populateInterestPaymentsData.js";

export const metricBuilderRegistry: Record<string, (db: Firestore, metric: Emetric_Metric) => Promise<void>> = {
  'fred_us_gdp_data_id': asyncPopulateGDPData,
  'fred_us_debt_gdp_ratio_id': asyncPopulateDebtGDPData,
  'treasury_treasury_bond_avg_interest_rates': asyncPopulateTreasuryBondAverageInterestRateData,
  'fred_us_federal_receipts_id': asyncPopulateFederalReceiptsData,
  'fred_us_federal_expenditures_id': asyncPopulateFederalExpendituresData,
  'fred_us_interest_payments_id': asyncPopulateInterestPaymentsData
};
