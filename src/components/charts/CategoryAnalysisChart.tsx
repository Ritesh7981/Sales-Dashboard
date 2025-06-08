'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { CategoryAnalysisData, fetchCategoryAnalysisData, exportAsCSV, exportAsPDF } from '@/utils/api';
import { Bar } from 'react-chartjs-2';
import { type TooltipItem } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function CategoryAnalysisChart() {
  const { filters } = useDashboard();
  const [data, setData] = useState<CategoryAnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const categoryData = await fetchCategoryAnalysisData(filters);
        setData(categoryData);
        setError(null);
      } catch (err) {
        setError('Failed to load category analysis data');
        console.error('Error loading category analysis data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const handleExportCSV = () => {
    exportAsCSV(data as CategoryAnalysisData[], 'category_analysis_data');
  };

  const handleExportPDF = async () => {
    try {
      await exportAsPDF(data as CategoryAnalysisData[], 'Category Analysis Data', chartRef);
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Analysis</h3>
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Analysis</h3>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4">
          <p>No category data available for the selected filters.</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(item => item.revenue),
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
      {
        label: 'Units Sold',
        data: data.map(item => item.units),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            const label = context.dataset.label || '';
            const rawValue = context.raw;
            if (label === 'Revenue') {
              return `${label}: ${typeof rawValue === 'number' ? formatCurrency(rawValue) : rawValue}`;
            }
            return `${label}: ${rawValue}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            if (typeof value === 'number') {
              return formatCurrency(value);
            }
            return value;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Category Analysis</h3>
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
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}