import type { SalesData as __SalesData } from '@/app/api/sales/route';
export type SalesData = __SalesData;

// Types for analytics data
export interface OverviewData {
  totalRevenue: number;
  totalUnits: number;
  uniqueProducts: number;
  uniqueCategories: number;
  uniqueRegions: number;
  uniqueSalesReps: number;
  uniqueCustomers: number;
  dataPoints: number;
}

export interface RevenueTrendData {
  month: string;
  revenue: number;
  units: number;
}

export interface RegionSalesData {
  region: string;
  revenue: number;
  units: number;
}

export interface ProductPerformanceData {
  product: string;
  revenue: number;
  units: number;
}

export interface CategoryAnalysisData {
  category: string;
  revenue: number;
  units: number;
}

export interface CustomerTypeAnalysisData {
  type: string;
  revenue: number;
  units: number;
  deals: number;
}

export interface SalesRepPerformanceData {
  name: string;
  revenue: number;
  units: number;
  deals: number;
}

export interface MonthlyGrowthData {
  month: string;
  revenue: number;
  growth?: number;
}

// Type for filter parameters
export interface FilterParams {
  startDate?: string;
  endDate?: string;
  region?: string;
  product?: string;
  salesRep?: string;
  category?: string;
  customerType?: string;
  searchQuery?: string;
}

// Function to build query string from filter parameters
function buildQueryString(params: FilterParams): string {
  const queryParams = new URLSearchParams();
  
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.region) queryParams.append('region', params.region);
  if (params.product) queryParams.append('product', params.product);
  if (params.salesRep) queryParams.append('salesRep', params.salesRep);
  if (params.category) queryParams.append('category', params.category);
  if (params.customerType) queryParams.append('customerType', params.customerType);
  if (params.searchQuery) queryParams.append('searchQuery', params.searchQuery);
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Function to fetch raw sales data
export async function fetchSalesData(filters: FilterParams = {}): Promise<__SalesData[]> {
  try {
    const queryString = buildQueryString(filters);
    const response = await fetch(`/api/sales${queryString}`);
      
    if (!response.ok) {
      throw new Error(`Error fetching sales data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch sales data:', error);
    throw error;
  }
}

// Function to fetch overview data
export async function fetchOverviewData(filters: FilterParams = {}): Promise<OverviewData> {
  try {
    const queryString = buildQueryString(filters);
    const response = await fetch(`/api/analytics${queryString}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching overview data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch overview data:', error);
    throw error;
  }
}

// Function to fetch revenue trend data
export async function fetchRevenueTrendData(filters: FilterParams = {}): Promise<RevenueTrendData[]> {
  try {
    const queryParams = new URLSearchParams(buildQueryString(filters));
    queryParams.append('type', 'revenue-trend');
    
    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching revenue trend data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch revenue trend data:', error);
    throw error;
  }
}

// Function to fetch region sales data
export async function fetchRegionSalesData(filters: FilterParams = {}): Promise<RegionSalesData[]> {
  try {
    const queryParams = new URLSearchParams(buildQueryString(filters));
    queryParams.append('type', 'region-sales');
    
    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching region sales data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch region sales data:', error);
    throw error;
  }
}

// Function to fetch product performance data
export async function fetchProductPerformanceData(filters: FilterParams = {}): Promise<ProductPerformanceData[]> {
  try {
    const queryParams = new URLSearchParams(buildQueryString(filters));
    queryParams.append('type', 'product-performance');
    
    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching product performance data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch product performance data:', error);
    throw error;
  }
}

// Function to fetch product details
export async function fetchProductDetails(productName: string): Promise<SalesData[]> {
  try {
    const response = await fetchSalesData({ product: productName });
    return response;
  } catch (error) {
    console.error(`Failed to fetch details for product ${productName}:`, error);
    throw error;
  }
}

// Function to fetch category analysis data
export async function fetchCategoryAnalysisData(filters: FilterParams = {}): Promise<CategoryAnalysisData[]> {
  try {
    const queryParams = new URLSearchParams(buildQueryString(filters));
    queryParams.append('type', 'category-analysis');
    
    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching category analysis data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch category analysis data:', error);
    throw error;
  }
}

// Function to fetch customer type analysis data
export async function fetchCustomerTypeAnalysisData(filters: FilterParams = {}): Promise<CustomerTypeAnalysisData[]> {
  try {
    const queryParams = new URLSearchParams(buildQueryString(filters));
    queryParams.append('type', 'customer-type-analysis');
    
    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching customer type analysis data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch customer type analysis data:', error);
    throw error;
  }
}

// Function to fetch sales rep performance data
export async function fetchSalesRepPerformanceData(filters: FilterParams = {}): Promise<SalesRepPerformanceData[]> {
  try {
    const queryParams = new URLSearchParams(buildQueryString(filters));
    queryParams.append('type', 'sales-rep-performance');
    
    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching sales rep performance data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch sales rep performance data:', error);
    throw error;
  }
}

// Function to fetch monthly growth data
export async function fetchMonthlyGrowthData(filters: FilterParams = {}): Promise<MonthlyGrowthData[]> {
  try {
    const queryParams = new URLSearchParams(buildQueryString(filters));
    queryParams.append('type', 'monthly-growth');
    
    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching monthly growth data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch monthly growth data:', error);
    throw error;
  }
}

// Function to get unique values for filters
export async function fetchFilterOptions(): Promise<{
  regions: string[];
  products: string[];
  salesReps: string[];
  categories: string[];
  customerTypes: string[];
}> {
  try {
    const salesData = await fetchSalesData();
    
    const regions = [...new Set(salesData.map((item: __SalesData) => item.region))];
    const products = [...new Set(salesData.map((item: __SalesData) => item.product))];
    const salesReps = [...new Set(salesData.map((item: __SalesData) => item.sales_rep))];
    const categories = [...new Set(salesData.map((item: __SalesData) => item.category))];
    const customerTypes = [...new Set(salesData.map((item: __SalesData) => item.customer_type))];
    
    return {
      regions,
      products,
      salesReps,
      categories,
      customerTypes
    };
  } catch (error) {
    console.error('Failed to fetch filter options:', error);
    throw error;
  }
}

// Function to export data as CSV
export function exportAsCSV<T extends object>(data: T[], filename: string): void {
  // Convert data to CSV format
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => Object.values(item).join(','));
  const csv = [headers, ...rows].join('\n');
  
  // Create a blob and download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create a link element and trigger download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Function to export data as PDF
export async function exportAsPDF<T extends object>(data: T[], filename: string, chartRef?: React.RefObject<HTMLDivElement | null>): Promise<void> {
  try {
    // Dynamically import jspdf and html2canvas to reduce bundle size
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    
    const pdf = new jsPDF('landscape');
    
    // Add title
    pdf.setFontSize(18);
    pdf.text(filename, 14, 22);
    
    // Add timestamp
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // If chart reference is provided, capture the chart as an image
    if (chartRef && chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 14, 40, 270, 150);
    }
    
    // Add table data
    if (data.length > 0) {
      pdf.setFontSize(12);
      const headers = Object.keys(data[0]);
      
      // Start position for table
      let yPos = chartRef && chartRef.current ? 200 : 40;
      
      // Add headers
      let xPos = 14;
      headers.forEach(header => {
        pdf.text(header, xPos, yPos);
        xPos += 40;
      });
      
      yPos += 10;
      
      // Add data rows
      data.forEach(row => {
        xPos = 14;
        Object.values(row).forEach(value => {
          pdf.text(String(value), xPos, yPos);
          xPos += 40;
        });
        yPos += 7;
        
        // If we're about to go off the page, add a new page
        if (yPos > 200) {
          pdf.addPage();
          yPos = 20;
        }
      });
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Failed to export as PDF:', error);
    throw error;
  }
}