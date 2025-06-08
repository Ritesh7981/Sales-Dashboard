import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { SalesData } from '../sales/route';

// Define the type for raw sales data items from CSV
interface RawSalesDataItem {
  date: string;
  sales_rep: string;
  region: string;
  category: string;
  product: string;
  quantity: string; // Initially string from CSV
  unit_price: string; // Initially string from CSV
  total_price: string; // Initially string from CSV
  customer_type: string;
  customer_name: string;
}

// Function to read and parse the CSV file
function readSalesData(): Promise<SalesData[]> {
  return new Promise((resolve, reject) => {
    try {
      // Get the path to the CSV file
      const filePath = path.join(process.cwd(), 'public', 'sales_data.csv');
      
      // Read the file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Parse the CSV
      Papa.parse<RawSalesDataItem>(fileContent, {
        header: true,
        complete: (results) => {
          // Transform the data to ensure numbers are parsed correctly
          const salesData = results.data.map((item: RawSalesDataItem) => ({
            ...item,
            quantity: parseInt(item.quantity, 10),
            unit_price: parseFloat(item.unit_price),
            total_price: parseFloat(item.total_price)
          })) as SalesData[];
          
          resolve(salesData);
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to apply filters
function applyFilters(data: SalesData[], url: URL): SalesData[] {
  let filteredData = [...data];
  
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  const region = url.searchParams.get('region');
  const product = url.searchParams.get('product');
  const salesRep = url.searchParams.get('salesRep');
  const category = url.searchParams.get('category');
  const customerType = url.searchParams.get('customerType');
  
  if (startDate) {
    filteredData = filteredData.filter(item => new Date(item.date) >= new Date(startDate));
  }
  
  if (endDate) {
    filteredData = filteredData.filter(item => new Date(item.date) <= new Date(endDate));
  }
  
  if (region) {
    filteredData = filteredData.filter(item => item.region === region);
  }
  
  if (product) {
    filteredData = filteredData.filter(item => item.product === product);
  }
  
  if (salesRep) {
    filteredData = filteredData.filter(item => item.sales_rep === salesRep);
  }

  if (category) {
    filteredData = filteredData.filter(item => item.category === category);
  }

  if (customerType) {
    filteredData = filteredData.filter(item => item.customer_type === customerType);
  }
  
  return filteredData;
}

// Helper function to extract month from date
function extractMonth(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// GET handler for the API route
export async function GET(request: Request) {
  try {
    // Get the URL to parse query parameters
    const url = new URL(request.url);
    const analysisType = url.searchParams.get('type') || 'overview';
    
    // Read the sales data
    const salesData = await readSalesData();
    
    // Apply filters
    const filteredData = applyFilters(salesData, url);
    
    let result;
    
    switch (analysisType) {
      case 'revenue-trend': {
        // Group data by month
        const dataByMonth = filteredData.reduce((acc, item) => {
          const month = extractMonth(item.date);
          if (!acc[month]) {
            acc[month] = { month, revenue: 0, units: 0 };
          }
          acc[month].revenue += item.total_price;
          acc[month].units += item.quantity;
          return acc;
        }, {} as Record<string, { month: string; revenue: number; units: number }>);
        
        // Convert to array and sort by month
        result = Object.values(dataByMonth).sort((a, b) => a.month.localeCompare(b.month));
        break;
      }
      
      case 'region-sales': {
        // Group data by region
        const dataByRegion = filteredData.reduce((acc, item) => {
          if (!acc[item.region]) {
            acc[item.region] = { region: item.region, revenue: 0, units: 0 };
          }
          acc[item.region].revenue += item.total_price;
          acc[item.region].units += item.quantity;
          return acc;
        }, {} as Record<string, { region: string; revenue: number; units: number }>);
        
        // Convert to array and sort by revenue
        result = Object.values(dataByRegion).sort((a, b) => b.revenue - a.revenue);
        break;
      }
      
      case 'product-performance': {
        // Group data by product
        const dataByProduct = filteredData.reduce((acc, item) => {
          if (!acc[item.product]) {
            acc[item.product] = { product: item.product, revenue: 0, units: 0 };
          }
          acc[item.product].revenue += item.total_price;
          acc[item.product].units += item.quantity;
          return acc;
        }, {} as Record<string, { product: string; revenue: number; units: number }>);
        
        // Convert to array and sort by revenue
        result = Object.values(dataByProduct).sort((a, b) => b.revenue - a.revenue);
        break;
      }
      
      case 'sales-rep-performance': {
        // Group data by sales rep
        const dataBySalesRep = filteredData.reduce((acc, item) => {
          if (!acc[item.sales_rep]) {
            acc[item.sales_rep] = { name: item.sales_rep, revenue: 0, units: 0, deals: 0 };
          }
          acc[item.sales_rep].revenue += item.total_price;
          acc[item.sales_rep].units += item.quantity;
          acc[item.sales_rep].deals += 1;
          return acc;
        }, {} as Record<string, { name: string; revenue: number; units: number; deals: number }>);
        
        // Convert to array and sort by revenue
        result = Object.values(dataBySalesRep).sort((a, b) => b.revenue - a.revenue);
        break;
      }
      
      case 'category-analysis': {
        // Group data by category
        const dataByCategory = filteredData.reduce((acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = { category: item.category, revenue: 0, units: 0 };
          }
          acc[item.category].revenue += item.total_price;
          acc[item.category].units += item.quantity;
          return acc;
        }, {} as Record<string, { category: string; revenue: number; units: number }>);
        
        // Convert to array and sort by revenue
        result = Object.values(dataByCategory).sort((a, b) => b.revenue - a.revenue);
        break;
      }

      case 'customer-type-analysis': {
        // Group data by customer type
        const dataByCustomerType = filteredData.reduce((acc, item) => {
          if (!acc[item.customer_type]) {
            acc[item.customer_type] = { type: item.customer_type, revenue: 0, units: 0, deals: 0 };
          }
          acc[item.customer_type].revenue += item.total_price;
          acc[item.customer_type].units += item.quantity;
          acc[item.customer_type].deals += 1;
          return acc;
        }, {} as Record<string, { type: string; revenue: number; units: number; deals: number }>);
        
        // Convert to array and sort by revenue
        result = Object.values(dataByCustomerType).sort((a, b) => b.revenue - a.revenue);
        break;
      }
      
      case 'monthly-growth': {
        // Group data by month
        const dataByMonth = filteredData.reduce((acc, item) => {
          const month = extractMonth(item.date);
          if (!acc[month]) {
            acc[month] = { month, revenue: 0 };
          }
          acc[month].revenue += item.total_price;
          return acc;
        }, {} as Record<string, { month: string; revenue: number; growth?: number }>);
        
        // Convert to array and sort by month
        const sortedMonths = Object.values(dataByMonth).sort((a, b) => a.month.localeCompare(b.month));
        
        // Calculate growth rates
        for (let i = 1; i < sortedMonths.length; i++) {
          const prevRevenue = sortedMonths[i - 1].revenue;
          const currentRevenue = sortedMonths[i].revenue;
          sortedMonths[i].growth = prevRevenue ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
        }
        
        result = sortedMonths;
        break;
      }
      
      case 'overview':
      default: {
        // Calculate summary statistics
        const totalRevenue = filteredData.reduce((sum, item) => sum + item.total_price, 0);
        const totalUnits = filteredData.reduce((sum, item) => sum + item.quantity, 0);
        const uniqueProducts = new Set(filteredData.map(item => item.product)).size;
        const uniqueCategories = new Set(filteredData.map(item => item.category)).size;
        const uniqueRegions = new Set(filteredData.map(item => item.region)).size;
        const uniqueSalesReps = new Set(filteredData.map(item => item.sales_rep)).size;
        const uniqueCustomers = new Set(filteredData.map(item => item.customer_name)).size;
        
        result = {
          totalRevenue,
          totalUnits,
          uniqueProducts,
          uniqueCategories,
          uniqueRegions,
          uniqueSalesReps,
          uniqueCustomers,
          dataPoints: filteredData.length
        };
        break;
      }
    }
    
    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics data' },
      { status: 500 }
    );
  }
}