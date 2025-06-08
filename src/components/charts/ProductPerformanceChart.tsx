'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';
import { useDashboard } from '@/context/DashboardContext';
import { exportAsCSV, exportAsPDF, fetchProductPerformanceData, fetchProductDetails, type ProductPerformanceData } from '@/utils/api';
import { SalesData } from '@/app/api/sales/route';

export default function ProductPerformanceChart() {
  const { filters, setFilters } = useDashboard();
  const [data, setData] = useState<ProductPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<SalesData[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const productData = await fetchProductPerformanceData(filters);
        setData(productData);
        setError(null);
      } catch (err) {
        setError('Failed to load product performance data');
        console.error('Error loading product performance data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const handleExportCSV = () => {
    exportAsCSV(data, 'product_performance_data');
  };

  const handleExportPDF = async () => {
    try {
      await exportAsPDF(data, 'Product Performance Data', chartRef);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
  };

  const handleBarClick = async (data: ProductPerformanceData) => {
    try {
      setIsLoading(true);
      const productName = data.product;
      setSelectedProduct(productName);
      
      // Fetch detailed data for the selected product
      const details = await fetchProductDetails(productName);
      setProductDetails(details);
      setShowDetails(true);
      setError(null);
    } catch (err) {
      setError(`Failed to load details for product`);
      console.error('Error loading product details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToChart = () => {
    setShowDetails(false);
    setSelectedProduct(null);
  };

  const handleApplyProductFilter = () => {
    if (selectedProduct) {
      setFilters({
        ...filters,
        product: selectedProduct
      });
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const detailsActions = (
    <div className="flex space-x-2">
      <button
        onClick={handleBackToChart}
        className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
      >
        Back to Chart
      </button>
      <button
        onClick={handleApplyProductFilter}
        className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
      >
        Apply as Filter
      </button>
    </div>
  );

  return (
    <Card 
      title={showDetails ? `Product Details: ${selectedProduct}` : "Product Performance"} 
      isLoading={isLoading} 
      error={error}
      actions={showDetails ? detailsActions : exportButtons}
      className="h-96 md:h-[30rem]"
    >
      <div ref={chartRef} className="w-full h-full">
        {!showDetails ? (
          data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                onClick={(data) => data && handleBarClick(data.activePayload?.[0]?.payload)}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="product" 
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
                  tickFormatter={formatNumber}
                  tick={{ fontSize: 12 }}
                  orientation="right"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'Revenue') return [formatCurrency(value), name];
                    return [formatNumber(value), name];
                  }}
                  labelFormatter={(label) => `Product: ${label}`}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="revenue" 
                  name="Revenue" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                />
                <Bar 
                  yAxisId="right"
                  dataKey="units" 
                  name="Units Sold" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : !isLoading && !error ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No data available for the selected filters</p>
            </div>
          ) : null
        ) : (
          <div className="overflow-auto h-full">
            <p className="text-sm text-gray-500 mb-2">Click on a row to see more details</p>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Rep</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productDetails.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sales_rep}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.region}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.unit_price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.total_price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.customer_name} ({item.customer_type})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}