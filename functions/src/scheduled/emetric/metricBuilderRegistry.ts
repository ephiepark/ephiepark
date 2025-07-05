import { Firestore } from "node_modules/firebase-admin/lib/firestore/index.js";
import { Emetric_Metric } from "../../shared/types.js";
import { asyncPopulateGDPData } from "./populateGDPData.js";
import { asyncPopulateDebtGDPData } from "./populateDebtGDPData.js";
import { asyncPopulateTreasuryBondAverageInterestRateData } from "./populateTreasuryBondAverageInterestRateData.js";
import { asyncPopulateFederalReceiptsData } from "./populateFederalReceiptsData.js";
import { asyncPopulateFederalExpendituresData } from "./populateFederalExpendituresData.js";
import { asyncPopulateInterestPaymentsData } from "./populateInterestPaymentsData.js";
import { asyncPopulateMarketableDebtExpirationData } from "./populateMarketableDebtExpirationData.js";
import { asyncPopulateMarketableDebtMaturityPercentileData } from "./populateMarketableDebtMaturityPercentileData.js";
import { asyncPopulateTotalMarketableDebtData } from "./populateTotalMarketableDebtData.js";
import { asyncPopulateTotalNonmarketableDebtData } from "./populateTotalNonmarketableDebtData.js";
import { asyncPopulateMarketableDebtBillsData } from "./populateMarketableDebtBillsData.js";
import { asyncPopulateMarketableDebtNotesData } from "./populateMarketableDebtNotesData.js";
import { asyncPopulateMarketableDebtBondsData } from "./populateMarketableDebtBondsData.js";

export const metricBuilderRegistry: Record<string, (db: Firestore, metric: Emetric_Metric) => Promise<void>> = {
  'treasury_us_total_marketable_debt': asyncPopulateTotalMarketableDebtData,
  'treasury_us_total_nonmarketable_debt': asyncPopulateTotalNonmarketableDebtData,
  'treasury_us_marketable_debt_bills': asyncPopulateMarketableDebtBillsData,
  'treasury_us_marketable_debt_notes': asyncPopulateMarketableDebtNotesData,
  'treasury_us_marketable_debt_bonds': asyncPopulateMarketableDebtBondsData,
  'fred_us_gdp_data_id': asyncPopulateGDPData,
  'fred_us_debt_gdp_ratio_id': asyncPopulateDebtGDPData,
  'treasury_treasury_bond_avg_interest_rates': asyncPopulateTreasuryBondAverageInterestRateData,
  'fred_us_federal_receipts_id': asyncPopulateFederalReceiptsData,
  'fred_us_federal_expenditures_id': asyncPopulateFederalExpendituresData,
  'fred_us_interest_payments_id': asyncPopulateInterestPaymentsData,
  'treasury_us_marketable_debt_expiration_graph': asyncPopulateMarketableDebtExpirationData,
  'treasury_us_marketable_debt_maturity_percentile': asyncPopulateMarketableDebtMaturityPercentileData
};
