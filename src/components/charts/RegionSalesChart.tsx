'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';
import { useDashboard } from '@/context/DashboardContext';
import { RegionSalesData, fetchRegionSalesData, exportAsCSV, exportAsPDF } from '@/utils/api';

export default function RegionSalesChart() {
  const { filters } = useDashboard();
  const [data, setData] = useState<RegionSalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const regionData = await fetchRegionSalesData(filters);
        setData(regionData);
        setError(null);
      } catch (err) {
        setError('Failed to load region sales data');
        console.error('Error loading region sales data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const handleExportCSV = () => {
    exportAsCSV(data, 'region_sales_data');
  };

  const handleExportPDF = async () => {
    try {
      await exportAsPDF(data, 'Region Sales Data', chartRef);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const exportButtons = (
    <div className="flex space-x-2">
      <button
        onClick={handleExportCSV}
        className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
        disabled={isLoading || data.length === 0}
      >
        Export CSV
      </button>
      <button
        onClick={handleExportPDF}
        className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
        disabled={isLoading || data.length === 0}
      >
        Export PDF
      </button>
    </div>
  );

  return (
    <Card 
      title="Sales by Region" 
      isLoading={isLoading} 
      error={error}
      actions={exportButtons}
      className="h-[30rem] md:h-[30rem]"
    >
      <div ref={chartRef} className="w-full h-full">
        {data.length > 0 ? (
       <ResponsiveContainer width="100%" height="100%">
       <BarChart
         data={data}
         margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
         layout="vertical"
       >
         <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
         <XAxis 
           type="number"
           tickFormatter={formatCurrency}
           tick={{ fontSize: 12 }}
         />
         <YAxis 
           type="category"
           dataKey="region" 
           tick={{ fontSize: 12 }}
           width={120}
         />
         <Tooltip 
           formatter={(value: number) => [formatCurrency(value), 'Revenue']}
           labelFormatter={(label) => `Region: ${label}`}
         />
         <Legend />
         <Bar 
           dataKey="revenue" 
           name="Revenue" 
           fill="#3b82f6"
           radius={[0, 4, 4, 0]}
         />
       </BarChart>
     </ResponsiveContainer>
     
        ) : !isLoading && !error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No data available for the selected filters</p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}