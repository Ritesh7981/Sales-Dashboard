'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { fetchSalesData, SalesData } from '@/utils/api';

// Define interfaces for processed chart data
interface MonthlySalesData {
  month: string;
  revenue: number;
  units: number;
}

interface RegionSalesDataProductPage {
  region: string;
  revenue: number;
  units: number;
}

interface CustomerTypeDataProductPage {
  type: string;
  revenue: number;
  units: number;
  deals: number;
}
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProductDetailPage() {
  const params = useParams();
  const productName = decodeURIComponent(params.product as string);
  
  const [productData, setProductData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);
  const [regionSales, setRegionSales] = useState<RegionSalesDataProductPage[]>([]);
  const [customerTypes, setCustomerTypes] = useState<CustomerTypeDataProductPage[]>([]);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setIsLoading(true);
        const salesData = await fetchSalesData({ product: productName });
        setProductData(salesData);
        
        // Process data for charts
        processChartData(salesData);
        
        setError(null);
      } catch (err) {
        setError('Failed to load product data');
        console.error('Error loading product data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [productName]);

  const processChartData = (data: SalesData[]) => {
    // Process monthly sales data
    const monthlyData = data.reduce((acc: Record<string, MonthlySalesData>, item) => {
      const date = new Date(item.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[month]) {
        acc[month] = { month, revenue: 0, units: 0 };
      }
      
      acc[month].revenue += item.total_price;
      acc[month].units += item.quantity;
      
      return acc;
    }, {});
    
    // Process region sales data
    const regionData = data.reduce((acc: Record<string, RegionSalesDataProductPage>, item) => {
      if (!acc[item.region]) {
        acc[item.region] = { region: item.region, revenue: 0, units: 0 };
      }
      
      acc[item.region].revenue += item.total_price;
      acc[item.region].units += item.quantity;
      
      return acc;
    }, {});
    
    // Process customer type data
    const customerTypeData = data.reduce((acc: Record<string, CustomerTypeDataProductPage>, item) => {
      if (!acc[item.customer_type]) {
        acc[item.customer_type] = { type: item.customer_type, revenue: 0, units: 0, deals: 0 };
      }
      
      acc[item.customer_type].revenue += item.total_price;
      acc[item.customer_type].units += item.quantity;
      acc[item.customer_type].deals += 1;
      
      return acc;
    }, {});
    
    setMonthlySales(Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)));
    setRegionSales(Object.values(regionData).sort((a, b) => b.revenue - a.revenue));
    setCustomerTypes(Object.values(customerTypeData).sort((a, b) => b.revenue - a.revenue));
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

  // Calculate product summary
  const totalRevenue = productData.reduce((sum, item) => sum + item.total_price, 0);
  const totalUnits = productData.reduce((sum, item) => sum + item.quantity, 0);
  const averagePrice = totalUnits > 0 ? totalRevenue / totalUnits : 0;
  const totalSales = productData.length;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{productName}</h1>
        <p className="text-gray-600">
          Detailed performance analysis for this product.
        </p>
      </div>

      {/* Product Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Total Revenue" isLoading={isLoading} error={error}>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</div>
        </Card>
        <Card title="Units Sold" isLoading={isLoading} error={error}>
          <div className="text-2xl font-bold text-green-600">{formatNumber(totalUnits)}</div>
        </Card>
        <Card title="Average Price" isLoading={isLoading} error={error}>
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(averagePrice)}</div>
        </Card>
        <Card title="Total Sales" isLoading={isLoading} error={error}>
          <div className="text-2xl font-bold text-orange-600">{formatNumber(totalSales)}</div>
        </Card>
      </div>

      {/* Monthly Sales Chart */}
      <Card 
        title="Monthly Sales" 
        isLoading={isLoading} 
        error={error}
        className="mb-6 h-full"
      >
        {monthlySales.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlySales}
              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
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
              <Bar 
                yAxisId="right"
                dataKey="units" 
                name="Units Sold" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : !isLoading && !error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No monthly sales data available</p>
          </div>
        ) : null}
      </Card>

      {/* Region Sales and Customer Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Region Sales */}
        <Card 
          title="Sales by Region" 
          isLoading={isLoading} 
          error={error}
          className="h-80"
        >
          {regionSales.length > 0 ? (
            <div className="overflow-y-auto max-h-64">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {regionSales.map((region, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {region.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(region.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(region.units)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !isLoading && !error ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No region sales data available</p>
            </div>
          ) : null}
        </Card>

        {/* Customer Types */}
        <Card 
          title="Sales by Customer Type" 
          isLoading={isLoading} 
          error={error}
          className="h-80"
        >
          {customerTypes.length > 0 ? (
            <div className="overflow-y-auto max-h-64">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deals
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerTypes.map((type, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {type.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(type.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(type.units)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(type.deals)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !isLoading && !error ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No customer type data available</p>
            </div>
          ) : null}
        </Card>
      </div>

      {/* Raw Sales Data */}
      <Card 
        title="Recent Sales" 
        isLoading={isLoading} 
        error={error}
        className="mb-6"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Rep
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productData.slice(0, 10).map((sale, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.sales_rep}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(sale.quantity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(sale.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(sale.total_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.customer_name} ({sale.customer_type})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {productData.length === 0 && !isLoading && !error ? (
          <div className="text-center py-4 text-gray-500">
            No sales data available
          </div>
        ) : productData.length > 10 ? (
          <div className="text-right mt-4 text-sm text-gray-500">
            Showing 10 of {productData.length} records
          </div>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}