'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';
import { useDashboard } from '@/context/DashboardContext';
import { RevenueTrendData, fetchRevenueTrendData, exportAsCSV, exportAsPDF } from '@/utils/api';

export default function RevenueTrendChart() {
  const { filters } = useDashboard();
  const [data, setData] = useState<RevenueTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const trendData = await fetchRevenueTrendData(filters);
        setData(trendData);
        setError(null);
      } catch (err) {
        setError('Failed to load revenue trend data');
        console.error('Error loading revenue trend data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const handleExportCSV = () => {
    exportAsCSV(data, 'revenue_trend_data');
  };

  const handleExportPDF = async () => {
    try {
      await exportAsPDF(data, 'Revenue Trend Data', chartRef);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
  };

  // Format month for display
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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

  const chartData = data.map(item => ({
    ...item,
    formattedMonth: formatMonth(item.month),
  }));
console.log(chartData)
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
  {console.log(chartData)}

  return (
    <Card 
      title="Revenue Trends" 
      isLoading={isLoading} 
      error={error}
      actions={exportButtons}
      className="h-[30rem] md:h-[30rem]"
    >
      <div  className="w-full h-full">

        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="formattedMonth"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
          </LineChart>
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