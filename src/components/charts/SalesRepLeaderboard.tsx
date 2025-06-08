'use client';

import React, { useState, useEffect, useRef } from 'react';
import Card from '@/components/ui/Card';
import { useDashboard } from '@/context/DashboardContext';
import { SalesRepPerformanceData, fetchSalesRepPerformanceData, exportAsCSV, exportAsPDF } from '@/utils/api';

export default function SalesRepLeaderboard() {
  const { filters } = useDashboard();
  const [data, setData] = useState<SalesRepPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const salesRepData = await fetchSalesRepPerformanceData(filters);
        setData(salesRepData);
        setError(null);
      } catch (err) {
        setError('Failed to load sales rep performance data');
        console.error('Error loading sales rep performance data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const handleExportCSV = () => {
    exportAsCSV(data, 'sales_rep_performance_data');
  };

  const handleExportPDF = async () => {
    try {
      await exportAsPDF(data, 'Sales Rep Performance Data', chartRef);
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

  // Format number with commas
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
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

  // Calculate max revenue for progress bars
  const maxRevenue = data.length > 0 ? Math.max(...data.map(rep => rep.revenue)) : 0;

  return (
    <Card 
      title="Sales Rep Performance" 
      isLoading={isLoading} 
      error={error}
      actions={exportButtons}
      className="h-[calc(50vh-100px)] overflow-y-scroll"
    >
      <div ref={chartRef} className="w-full h-full">
        {data.length > 0 ? (
          <div className="space-y-4">
            {data.map((rep, index) => {
              const progressPercentage = (rep.revenue / maxRevenue) * 100;
              
              // Determine medal for top 3
              let medal = null;
              if (index === 0) medal = '🥇';
              else if (index === 1) medal = '🥈';
              else if (index === 2) medal = '🥉';
              
              return (
                <div key={rep.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="text-xl font-bold mr-2">{index + 1}</span>
                      <h3 className="font-semibold text-gray-800">
                        {medal && <span className="mr-2">{medal}</span>}
                        {rep.name}
                      </h3>
                    </div>
                    <span className="font-bold text-blue-600">{formatCurrency(rep.revenue)}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{formatNumber(rep.units)}</span> units sold
                    </div>
                    <div>
                      <span className="font-medium">{formatNumber(rep.deals)}</span> deals
                    </div>
                    <div>
                      <span className="font-medium">{formatCurrency(rep.revenue / rep.deals)}</span> avg. deal
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !isLoading && !error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No data available for the selected filters</p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}