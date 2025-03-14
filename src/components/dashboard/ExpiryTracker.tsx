
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getExpiringMedicines } from "@/services/inventoryService";
import { Link } from "react-router-dom";
import { differenceInDays } from "date-fns";

export const ExpiryTracker = () => {
  const { data: expiryItems, isLoading } = useQuery({
    queryKey: ['expiringMedicines30'],
    queryFn: () => getExpiringMedicines(30) // Get items expiring in the next 30 days
  });

  const limitedItems = expiryItems?.slice(0, 4) || [];

  const getDaysLeft = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.max(0, differenceInDays(expiry, today));
  };

  return (
    <div className="bg-card rounded-xl shadow-soft overflow-hidden transition-apple hover:shadow-md">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-secondary-500" />
          <h3 className="font-medium">Upcoming Expiries</h3>
        </div>
        <Badge variant="outline" className="bg-secondary-500/10 text-secondary-500 border-secondary-500/20">
          {isLoading ? "..." : expiryItems?.length || 0} items
        </Badge>
      </div>
      
      {isLoading ? (
        <div className="p-4 text-center text-muted-foreground">Loading expiry data...</div>
      ) : limitedItems.length > 0 ? (
        <div className="divide-y divide-border">
          {limitedItems.map((item) => {
            const daysLeft = getDaysLeft(item.expiry_date);
            
            return (
              <div key={item.id} className="px-5 py-3 hover:bg-muted/30 transition-apple">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Batch: {item.batch_number || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" 
                      className={
                        daysLeft <= 10 
                          ? "bg-accent-500/10 text-accent-500 border-accent-500/20" 
                          : "bg-secondary-500/10 text-secondary-500 border-secondary-500/20"
                      }
                    >
                      {daysLeft} days left
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{item.expiry_date}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-4 text-center text-muted-foreground">No items expiring soon</div>
      )}
      
      <div className="px-5 py-3 border-t border-border">
        <Link to="/expiry-tracking" className="text-sm text-secondary-500 hover:text-secondary-600 font-medium transition-apple">
          View all expiries
        </Link>
      </div>
    </div>
  );
};
