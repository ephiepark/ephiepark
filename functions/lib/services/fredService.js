import fetch from "node-fetch";
/**
 * Service for interacting with the FRED API
 */
export class FredService {
    /**
     * Creates a new FRED service instance
     * @param {string} apiKey - The FRED API key
     */
    constructor(apiKey) {
        this.config = {
            apiKey,
            baseUrl: "https://api.stlouisfed.org/fred/series",
        };
    }
    /**
     * Fetches metric data from FRED API
     * @param {Metric} metric - The metric to fetch data for
     * @return {Promise<MetricData[]>} The fetched metric data
     */
    async fetchMetricData(metric) {
        if (!metric.sourceKey) {
            throw new Error("FRED series ID (sourceKey) is required");
        }
        const params = new URLSearchParams({
            series_id: metric.sourceKey,
            api_key: this.config.apiKey,
            file_type: "json",
            observation_start: this.getStartDate(metric.frequency),
            observation_end: new Date().toISOString().split("T")[0],
        });
        const response = await fetch(`${this.config.baseUrl}/observations?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`FRED API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.observations
            .filter((obs) => obs.value !== ".") // Filter out missing values
            .map((obs) => ({
            metricId: metric.id,
            timestamp: new Date(obs.date).getTime(),
            value: parseFloat(obs.value),
        }));
    }
    /**
     * Gets the start date for data fetching based on frequency
     * @param {string} frequency - The data frequency
     * @return {string} The start date in ISO format
     */
    getStartDate(frequency) {
        const now = new Date();
        const date = new Date(now);
        switch (frequency) {
            case "daily":
                date.setMonth(now.getMonth() - 3); // Last 3 months
                break;
            case "weekly":
                date.setMonth(now.getMonth() - 6); // Last 6 months
                break;
            case "monthly":
                date.setFullYear(now.getFullYear() - 2); // Last 2 years
                break;
            case "quarterly":
                date.setFullYear(now.getFullYear() - 5); // Last 5 years
                break;
            case "yearly":
                date.setFullYear(now.getFullYear() - 10); // Last 10 years
                break;
            default:
                date.setFullYear(now.getFullYear() - 1); // Default to 1 year
        }
        return date.toISOString().split("T")[0];
    }
    /**
     * Validates if a FRED series ID exists
     * @param {string} seriesId - The FRED series ID to validate
     * @return {Promise<boolean>} Whether the series ID is valid
     */
    async validateSeriesId(seriesId) {
        const params = new URLSearchParams({
            series_id: seriesId,
            api_key: this.config.apiKey,
            file_type: "json",
        });
        try {
            const response = await fetch(`${this.config.baseUrl}?${params.toString()}`);
            return response.ok;
        }
        catch (_a) {
            return false;
        }
    }
}
export default FredService;
//# sourceMappingURL=fredService.js.map