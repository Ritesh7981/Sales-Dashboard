'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FilterParams, fetchFilterOptions } from '@/utils/api';

interface DashboardContextType {
  filters: FilterParams;
  setFilters: (filters: FilterParams) => void;
  resetFilters: () => void;
  filterOptions: {
    regions: string[];
    products: string[];
    salesReps: string[];
    categories: string[];
    customerTypes: string[];
  };
  isLoading: boolean;
  error: string | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [filters, setFilters] = useState<FilterParams>({});
  const [filterOptions, setFilterOptions] = useState<{
    regions: string[];
    products: string[];
    salesReps: string[];
    categories: string[];
    customerTypes: string[];
  }>({
    regions: [],
    products: [],
    salesReps: [],
    categories: [],
    customerTypes: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset filters to default values
  const resetFilters = () => {
    setFilters({});
  };

  // Fetch filter options on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setIsLoading(true);
        const options = await fetchFilterOptions();
        setFilterOptions(options);
        setError(null);
      } catch (err) {
        setError('Failed to load filter options');
        console.error('Error loading filter options:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const value = {
    filters,
    setFilters,
    resetFilters,
    filterOptions,
    isLoading,
    error
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}