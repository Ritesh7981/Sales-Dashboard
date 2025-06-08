import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

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

// Define the type for our sales data
export interface SalesData {
  date: string;
  sales_rep: string;
  region: string;
  category: string;
  product: string;
  quantity: number;
  unit_price: number;
  total_price: number;
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

// GET handler for the API route
export async function GET(request: Request) {
  try {
    // Get the URL to parse query parameters
    const url = new URL(request.url);
    
    // Get query parameters for filtering
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const region = url.searchParams.get('region');
    const product = url.searchParams.get('product');
    const salesRep = url.searchParams.get('salesRep');
    const category = url.searchParams.get('category');
    const customerType = url.searchParams.get('customerType');
    
    // Read the sales data
    let salesData = await readSalesData();
    
    // Apply filters if provided
    if (startDate) {
      salesData = salesData.filter(item => new Date(item.date) >= new Date(startDate));
    }
    
    if (endDate) {
      salesData = salesData.filter(item => new Date(item.date) <= new Date(endDate));
    }
    
    if (region) {
      salesData = salesData.filter(item => item.region === region);
    }
    
    if (product) {
      salesData = salesData.filter(item => item.product === product);
    }
    
    if (salesRep) {
      salesData = salesData.filter(item => item.sales_rep === salesRep);
    }

    if (category) {
      salesData = salesData.filter(item => item.category === category);
    }

    if (customerType) {
      salesData = salesData.filter(item => item.customer_type === customerType);
    }
    
    // Return the filtered data
    return NextResponse.json(salesData);
  } catch (error) {
    console.error('Error processing sales data:', error);
    return NextResponse.json(
      { error: 'Failed to process sales data' },
      { status: 500 }
    );
  }
}