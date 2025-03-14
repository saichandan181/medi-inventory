
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { StockAlerts } from "@/components/dashboard/StockAlerts";
import { ExpiryTracker } from "@/components/dashboard/ExpiryTracker";
import { StockChart } from "@/components/dashboard/StockChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Dashboard = () => {
  // Set dark mode by default for demonstration
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        <PageHeader 
          title="Dashboard" 
          description="Overview of your inventory management system."
          actions={
            <Button className="bg-secondary-500 hover:bg-secondary-600">
              <Plus className="mr-1" size={16} />
              Add Medicine
            </Button>
          }
        />
        
        <div className="space-y-6">
          {/* Stats Overview */}
          <StatsOverview />
          
          {/* Three Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <StockChart />
            </div>
            <div>
              <StockAlerts />
            </div>
          </div>
          
          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <RecentTransactions />
            <ExpiryTracker />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
