
import { Package, Users, ShoppingCart, AlertCircle } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/inventoryService";

export const StatsOverview = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats
  });
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <DashboardCard
        title="Total Inventory"
        value={isLoading ? "Loading..." : data?.totalInventory.toString() || "0"}
        icon={<Package size={20} className="text-secondary-500" />}
        trend={{ value: 12, isPositive: true }}
      />
      
      <DashboardCard
        title="Total Suppliers"
        value={isLoading ? "Loading..." : data?.totalSuppliers.toString() || "0"}
        icon={<Users size={20} className="text-secondary-500" />}
        trend={{ value: 4, isPositive: true }}
      />
      
      <DashboardCard
        title="Pending Orders"
        value={isLoading ? "Loading..." : data?.pendingOrders.toString() || "0"}
        icon={<ShoppingCart size={20} className="text-secondary-500" />}
      />
      
      <DashboardCard
        title="Low Stock Items"
        value={isLoading ? "Loading..." : data?.lowStockItems.toString() || "0"}
        icon={<AlertCircle size={20} className="text-accent-500" />}
        trend={{ value: 8, isPositive: false }}
        className="border-l-4 border-l-accent-500"
      />
    </div>
  );
};
