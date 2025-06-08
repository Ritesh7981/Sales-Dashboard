'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';

export default function FilterBar() {
  const { filters, setFilters, resetFilters, filterOptions, isLoading } = useDashboard();
  
  // Local state for form inputs
  const [localFilters, setLocalFilters] = useState({
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    region: filters.region || '',
    product: filters.product || '',
    salesRep: filters.salesRep || '',
    category: filters.category || '',
    customerType: filters.customerType || '',
    searchQuery: filters.searchQuery || ''
  });

  // State for filtered options based on search
  const [filteredOptions, setFilteredOptions] = useState({
    products: filterOptions.products,
    salesReps: filterOptions.salesReps
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      searchQuery: value
    }));

    // Filter options based on search query
    if (value) {
      const query = value.toLowerCase();
      setFilteredOptions({
        products: filterOptions.products.filter(product => 
          product.toLowerCase().includes(query)
        ),
        salesReps: filterOptions.salesReps.filter(rep => 
          rep.toLowerCase().includes(query)
        )
      });
    } else {
      setFilteredOptions({
        products: filterOptions.products,
        salesReps: filterOptions.salesReps
      });
    }
  };

  // Update filtered options when filter options change
  useEffect(() => {
    if (localFilters.searchQuery) {
      const query = localFilters.searchQuery.toLowerCase();
      setFilteredOptions({
        products: filterOptions.products.filter(product => 
          product.toLowerCase().includes(query)
        ),
        salesReps: filterOptions.salesReps.filter(rep => 
          rep.toLowerCase().includes(query)
        )
      });
    } else {
      setFilteredOptions({
        products: filterOptions.products,
        salesReps: filterOptions.salesReps
      });
    }
  }, [filterOptions, localFilters.searchQuery]);

  // Apply filters
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(localFilters);
  };

  // Reset filters
  const handleResetFilters = () => {
    resetFilters();
    setLocalFilters({
      startDate: '',
      endDate: '',
      region: '',
      product: '',
      salesRep: '',
      category: '',
      customerType: '',
      searchQuery: ''
    });
    setFilteredOptions({
      products: filterOptions.products,
      salesReps: filterOptions.salesReps
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Dashboard</h2>
      
      {/* Search Bar */}
      <div className="mb-4">
        <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
          Search Products or Sales Reps
        </label>
        <input
          type="text"
          id="searchQuery"
          name="searchQuery"
          value={localFilters.searchQuery}
          onChange={handleSearchChange}
          placeholder="Type to search..."
          className="w-full px-3 py-2 border placeholder:text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
      </div>
      
      <form onSubmit={handleApplyFilters} className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 md:gap-4">
        {/* Date Range Filters */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={localFilters.startDate}
            onChange={handleChange}
            className="w-full placeholder:text-black text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={localFilters.endDate}
            onChange={handleChange}
            className="w-full px-3 placeholder:text-black text-black py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        
        {/* Region Filter */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            id="region"
            name="region"
            value={localFilters.region}
            onChange={handleChange}
            className="w-full px-3 placeholder:text-black text-black py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">All Regions</option>
            {filterOptions.regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        {/* Product Filter */}
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
            Product
          </label>
          <select
            id="product"
            name="product"
            value={localFilters.product}
            onChange={handleChange}
            className="w-full px-3 py-2 placeholder:text-black text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">All Products</option>
            {filteredOptions.products.map(product => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
        </div>
        
        {/* Sales Rep Filter */}
        <div>
          <label htmlFor="salesRep" className="block text-sm font-medium text-gray-700 mb-1">
            Sales Rep
          </label>
          <select
            id="salesRep"
            name="salesRep"
            value={localFilters.salesRep}
            onChange={handleChange}
            className="w-full px-3 py-2 placeholder:text-black text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">All Sales Reps</option>
            {filteredOptions.salesReps.map(rep => (
              <option key={rep} value={rep}>{rep}</option>
            ))}
          </select>
        </div>
        
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={localFilters.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">All Categories</option>
            {filterOptions.categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        {/* Customer Type Filter */}
        <div>
          <label htmlFor="customerType" className="block text-sm font-medium text-gray-700 mb-1">
            Customer Type
          </label>
          <select
            id="customerType"
            name="customerType"
            value={localFilters.customerType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">All Customer Types</option>
            {filterOptions.customerTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        {/* Action Buttons */}
        <div className="col-span-full flex justify-end space-x-4 mt-4">
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
}