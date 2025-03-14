
import { Package, Users, ShoppingCart, AlertCircle } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

export const StatsOverview = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <DashboardCard
        title="Total Inventory"
        value="1,542"
        icon={<Package size={20} className="text-secondary-500" />}
        trend={{ value: 12, isPositive: true }}
      />
      
      <DashboardCard
        title="Total Suppliers"
        value="38"
        icon={<Users size={20} className="text-secondary-500" />}
        trend={{ value: 4, isPositive: true }}
      />
      
      <DashboardCard
        title="Pending Orders"
        value="7"
        icon={<ShoppingCart size={20} className="text-secondary-500" />}
      />
      
      <DashboardCard
        title="Low Stock Items"
        value="23"
        icon={<AlertCircle size={20} className="text-accent-500" />}
        trend={{ value: 8, isPositive: false }}
        className="border-l-4 border-l-accent-500"
      />
    </div>
  );
};
