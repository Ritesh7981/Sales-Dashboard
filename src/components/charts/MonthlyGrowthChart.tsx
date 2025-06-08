'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';
import { useDashboard } from '@/context/DashboardContext';
import { MonthlyGrowthData, fetchMonthlyGrowthData, exportAsCSV, exportAsPDF } from '@/utils/api';

export default function MonthlyGrowthChart() {
  const { filters } = useDashboard();
  const [data, setData] = useState<MonthlyGrowthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const growthData = await fetchMonthlyGrowthData(filters);
        setData(growthData);
        setError(null);
      } catch (err) {
        setError('Failed to load monthly growth data');
        console.error('Error loading monthly growth data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const handleExportCSV = () => {
    exportAsCSV(data, 'monthly_growth_data');
  };

  const handleExportPDF = async () => {
    try {
      await exportAsPDF(data, 'Monthly Growth Data', chartRef);
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

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const chartData = data.map(item => ({
    ...item,
    formattedMonth: formatMonth(item.month),
  }));

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
      title="Monthly Growth Rates" 
      isLoading={isLoading} 
      error={error}
      actions={exportButtons}
      className="h-[30rem]"
    >
      <div ref={chartRef} className="w-full h-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
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
                yAxisId="left"
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                orientation="left"
              />
              <YAxis 
                yAxisId="right"
                tickFormatter={formatPercentage}
                tick={{ fontSize: 12 }}
                orientation="right"
                domain={[-20, 20]}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'Revenue') return [formatCurrency(value), name];
                  if (name === 'Growth Rate') return [formatPercentage(value), name];
                  return [value, name];
                }}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="revenue" 
                name="Revenue" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Line 
                yAxisId="right"
                dataKey="growth" 
                name="Growth Rate" 
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
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