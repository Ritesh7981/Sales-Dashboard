'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { CustomerTypeAnalysisData, fetchCustomerTypeAnalysisData, exportAsCSV, exportAsPDF } from '@/utils/api';
import { Pie } from 'react-chartjs-2';
import { type TooltipItem } from 'chart.js';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function CustomerTypeAnalysisChart() {
  const { filters } = useDashboard();
  const [data, setData] = useState<CustomerTypeAnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const customerData = await fetchCustomerTypeAnalysisData(filters);
        setData(customerData);
        setError(null);
      } catch (err) {
        setError('Failed to load customer type analysis data');
        console.error('Error loading customer type analysis data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const handleExportCSV = () => {
    exportAsCSV(data as CustomerTypeAnalysisData[], 'customer_type_analysis_data');
  };

  const handleExportPDF = async () => {
    try {
      await exportAsPDF(data as CustomerTypeAnalysisData[], 'Customer Type Analysis Data', chartRef);
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-96 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-full bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Type Analysis</h3>
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Type Analysis</h3>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4">
          <p>No customer type data available for the selected filters.</p>
        </div>
      </div>
    );
  }

  // Generate colors for pie chart
  const generateColors = (count: number) => {
    const colors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
      'rgba(83, 102, 255, 0.6)',
      'rgba(40, 159, 64, 0.6)',
      'rgba(210, 199, 199, 0.6)',
    ];
    
    const borderColors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(199, 199, 199, 1)',
      'rgba(83, 102, 255, 1)',
      'rgba(40, 159, 64, 1)',
      'rgba(210, 199, 199, 1)',
    ];
    
    return {
      backgroundColor: colors.slice(0, count),
      borderColor: borderColors.slice(0, count)
    };
  };

  const { backgroundColor, borderColor } = generateColors(data.length);

  const chartData = {
    labels: data.map(item => item.type),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(item => item.revenue),
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'pie'>) {
            const label = context.label || '';
            const rawValue = context.raw;

            if (typeof rawValue !== 'number') {
              return `${label}: Data unavailable`;
            }

            const value: number = rawValue;

            let total = 0;
            if (context.dataset.data && Array.isArray(context.dataset.data)) {
              total = context.dataset.data.reduce((acc: number, val: unknown) => {
                return acc + (typeof val === 'number' ? val : 0);
              }, 0);
            }

            if (total === 0) {
              return `${label}: ${formatCurrency(value)} (N/A%)`;
            }

            const percentage = Math.round((value / total) * 100);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Customer Type Analysis</h3>
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
      </div>
      <div className="h-80" ref={chartRef}>
        <Pie data={chartData} options={options} />
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
        <ul className="space-y-1">
          {data.map((item, index) => (
                <li key={index} className="text-sm text-black">
              <span className="font-medium">{item.type}:</span> {formatCurrency(item.revenue)} from {item.deals} orders
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}