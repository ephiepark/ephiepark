# Economic Metrics Dashboard

A React-based dashboard for tracking and visualizing economic indicators from various data sources.

## Features

- Real-time economic data visualization from FRED (Federal Reserve Economic Data)
- Customizable metric cards with various chart types
- Categorized metrics view
- Data refresh controls
- User preferences and dashboard layout persistence
- Support for multiple data sources (FRED, Reddit sentiment analysis)

## Project Structure

```
emetric/
├── components/           # React components
│   ├── MetricCard.tsx   # Individual metric display
│   ├── MetricGrid.tsx   # Grid layout of metrics
│   └── *.css            # Component styles
├── services/            # Data services
│   ├── fredService.ts   # FRED API integration
│   └── metricService.ts # Firestore operations
├── hooks/               # Custom React hooks
│   └── useMetricData.ts # Data fetching hook
└── EmetricProject.tsx   # Main project component
```

## Data Sources

### FRED Integration
- Uses the FRED API to fetch economic data
- Supports various frequencies (daily, weekly, monthly, quarterly, yearly)
- Automatic data refresh based on frequency
- Configurable through the data source management UI

### Firestore Collections
- `emetric_metrics`: Metric definitions and configurations
- `emetric_sources`: Data source configurations
- `emetric_data`: Time series data points
- `emetric_user_preferences`: User dashboard layouts and preferences

## Setup

1. Configure FRED API Key:
   ```typescript
   // In your environment variables or Firebase config
   FRED_API_KEY=your_api_key_here
   ```

2. Initialize Firestore Collections:
   - The project automatically creates necessary collections
   - Default metrics are created on first initialization
   - Admin users can manage data sources and metrics

## Usage

### Adding New Metrics

1. Click "Add Metric" in the dashboard
2. Select a data source (e.g., FRED)
3. Configure metric properties:
   - Name and description
   - Source key (e.g., FRED series ID)
   - Category and unit
   - Display settings (chart type, etc.)

### Data Source Configuration

1. Click "Configure Data Sources"
2. Add/edit data source settings:
   - API keys
   - Base URLs
   - Authentication details

### User Preferences

- Dashboard layout is automatically saved
- Metric display preferences are persisted
- Alert configurations are stored per user

## Development

### Adding New Data Sources

1. Create a new service in `services/`
2. Implement the data source interface:
   ```typescript
   interface DataSourceService {
     fetchMetricData(metric: Metric): Promise<MetricData[]>;
     validateSourceKey(key: string): Promise<boolean>;
   }
   ```
3. Add the source type to the DataSource type union
4. Implement source-specific configuration UI

### Styling

- Uses CSS modules for component styling
- Follows the project's design system
- Responsive design for all screen sizes

## Security

- Firestore rules enforce access control
- Only authenticated users can view metrics
- Only admins can manage data sources and metrics
- User preferences are protected per user

## Future Enhancements

- [ ] Add more chart types
- [ ] Implement metric correlations
- [ ] Add export functionality
- [ ] Implement real-time updates
- [ ] Add more data sources
- [ ] Implement metric alerts
