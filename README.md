# Sales Analytics Dashboard

A comprehensive dashboard for sales analytics, providing insights into sales performance across regions, products, and time periods.

## Features

- **Data Import**: Import sales data from CSV files
- **Dashboard Interface**: Clean, responsive UI built with Next.js and Tailwind CSS
- **Visualizations**: Interactive charts and graphs for sales data analysis
- **Interactive Filters**: Filter data by date range, region, product, sales rep, and more
- **Search Functionality**: Search for specific products or sales representatives
- **Export Options**: Export data as CSV or PDF files
- **Drill-down Analysis**: Click on chart elements to view detailed information

## Tech Stack

- **Next.js**: React framework for server-rendered applications
- **React**: JavaScript library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Composable charting library for React
- **Chart.js**: JavaScript charting library
- **Context API**: For state management
- **TypeScript**: For type safety
- **PapaParse**: CSV parsing library
- **jsPDF & html2canvas**: For PDF export functionality

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Ritesh7981/sales-dashboard.git
   cd sales-dashboard
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── public/
│   └── sales_data.csv       # Sample sales data
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   │   ├── charts/          # Chart components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI components
│   ├── context/             # React context
│   └── utils/               # Utility functions
└── package.json
```

## Architecture and Data Flow

1. **Data Import**: CSV data is parsed using PapaParse
2. **Data Processing**: Raw data is processed and transformed for visualization
3. **State Management**: Dashboard context manages filter state and data fetching
4. **Visualization**: Processed data is displayed using Recharts and Chart.js
5. **Interactivity**: User interactions trigger filter changes and data updates
6. **Export**: Data can be exported as CSV or PDF files

## Assumptions and Trade-offs

- The dashboard assumes a specific CSV format for sales data
- For simplicity, data is loaded from a static CSV file rather than a database
- The application prioritizes client-side filtering for faster user interaction
- The dashboard is optimized for desktop viewing but is responsive for mobile devices

## Future Improvements

- Add authentication and user management
- Implement server-side filtering for larger datasets
- Add more advanced analytics features (forecasting, anomaly detection)
- Improve mobile experience with dedicated mobile layouts
- Add dark mode support
- Implement real-time data updates
- Add more export formats (Excel, JSON)
- Implement data caching for improved performance
