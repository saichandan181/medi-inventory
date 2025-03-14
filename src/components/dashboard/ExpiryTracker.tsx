
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data for expiry tracking
const expiryItems = [
  { id: 1, name: "Insulin Regular", batch: "IN4592", expiry: "2023-12-15", daysLeft: 5 },
  { id: 2, name: "Atorvastatin 20mg", batch: "AT2031", expiry: "2023-12-20", daysLeft: 10 },
  { id: 3, name: "Omeprazole 20mg", batch: "OM1298", expiry: "2023-12-25", daysLeft: 15 },
  { id: 4, name: "Fluoxetine 20mg", batch: "FL5673", expiry: "2023-12-30", daysLeft: 20 },
];

export const ExpiryTracker = () => {
  return (
    <div className="bg-card rounded-xl shadow-soft overflow-hidden transition-apple hover:shadow-md">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-secondary-500" />
          <h3 className="font-medium">Upcoming Expiries</h3>
        </div>
        <Badge variant="outline" className="bg-secondary-500/10 text-secondary-500 border-secondary-500/20">
          {expiryItems.length} items
        </Badge>
      </div>
      
      <div className="divide-y divide-border">
        {expiryItems.map((item) => (
          <div key={item.id} className="px-5 py-3 hover:bg-muted/30 transition-apple">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">Batch: {item.batch}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" 
                  className={
                    item.daysLeft <= 10 
                      ? "bg-accent-500/10 text-accent-500 border-accent-500/20" 
                      : "bg-secondary-500/10 text-secondary-500 border-secondary-500/20"
                  }
                >
                  {item.daysLeft} days left
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">{item.expiry}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-5 py-3 border-t border-border">
        <button className="text-sm text-secondary-500 hover:text-secondary-600 font-medium transition-apple">
          View all expiries
        </button>
      </div>
    </div>
  );
};
