import DashboardLayout from '@/components/layout/DashboardLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import OverviewStats from '@/components/dashboard/OverviewStats';
import RevenueTrendChart from '@/components/charts/RevenueTrendChart';
import RegionSalesChart from '@/components/charts/RegionSalesChart';
import ProductPerformanceChart from '@/components/charts/ProductPerformanceChart';
import SalesRepLeaderboard from '@/components/charts/SalesRepLeaderboard';
import MonthlyGrowthChart from '@/components/charts/MonthlyGrowthChart';
import CategoryAnalysisChart from '@/components/charts/CategoryAnalysisChart';
import CustomerTypeAnalysisChart from '@/components/charts/CustomerTypeAnalysisChart';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sales Analytics Dashboard</h1>
        <p className="text-gray-600">
          Track your sales performance, analyze trends, and identify opportunities for growth.
        </p>
      </div>
      
      <FilterBar />
      
      <OverviewStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueTrendChart />
        <RegionSalesChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProductPerformanceChart />
        <MonthlyGrowthChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CategoryAnalysisChart />
        <CustomerTypeAnalysisChart />
      </div>
      
      <div className="mb-6">
        <SalesRepLeaderboard />
      </div>
    </DashboardLayout>
  );
}
