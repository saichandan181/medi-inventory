
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getLowStockMedicines } from "@/services/inventoryService";
import { Link } from "react-router-dom";

export const StockAlerts = () => {
  const { data: stockAlerts, isLoading } = useQuery({
    queryKey: ['lowStockMedicines'],
    queryFn: getLowStockMedicines
  });

  const limitedAlerts = stockAlerts?.slice(0, 4) || [];

  return (
    <div className="bg-card rounded-xl shadow-soft overflow-hidden transition-apple hover:shadow-md">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-accent-500" />
          <h3 className="font-medium">Low Stock Alerts</h3>
        </div>
        <Badge variant="outline" className="bg-accent-500/10 text-accent-500 border-accent-500/20">
          {isLoading ? "..." : stockAlerts?.length || 0} items
        </Badge>
      </div>
      
      {isLoading ? (
        <div className="p-4 text-center text-muted-foreground">Loading stock alerts...</div>
      ) : limitedAlerts.length > 0 ? (
        <div className="divide-y divide-border">
          {limitedAlerts.map((item) => (
            <div key={item.id} className="px-5 py-3 hover:bg-muted/30 transition-apple">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-accent-500 font-medium">{item.stock_quantity} units</p>
                  <p className="text-xs text-muted-foreground">Threshold: {item.reorder_level}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-muted-foreground">No low stock items found</div>
      )}
      
      <div className="px-5 py-3 border-t border-border">
        <Link to="/low-stock" className="text-sm text-secondary-500 hover:text-secondary-600 font-medium transition-apple">
          View all alerts
        </Link>
      </div>
    </div>
  );
};
