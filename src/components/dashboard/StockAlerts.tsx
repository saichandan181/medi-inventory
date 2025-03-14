
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data for stock alerts
const stockAlerts = [
  { id: 1, name: "Amoxicillin 500mg", category: "Antibiotics", stock: 12, threshold: 20 },
  { id: 2, name: "Paracetamol 500mg", category: "Analgesics", stock: 8, threshold: 25 },
  { id: 3, name: "Salbutamol Inhaler", category: "Respiratory", stock: 5, threshold: 10 },
  { id: 4, name: "Metformin 500mg", category: "Antidiabetic", stock: 15, threshold: 30 },
];

export const StockAlerts = () => {
  return (
    <div className="bg-card rounded-xl shadow-soft overflow-hidden transition-apple hover:shadow-md">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-accent-500" />
          <h3 className="font-medium">Low Stock Alerts</h3>
        </div>
        <Badge variant="outline" className="bg-accent-500/10 text-accent-500 border-accent-500/20">
          {stockAlerts.length} items
        </Badge>
      </div>
      
      <div className="divide-y divide-border">
        {stockAlerts.map((item) => (
          <div key={item.id} className="px-5 py-3 hover:bg-muted/30 transition-apple">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.category}</p>
              </div>
              <div className="text-right">
                <p className="text-accent-500 font-medium">{item.stock} units</p>
                <p className="text-xs text-muted-foreground">Threshold: {item.threshold}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-5 py-3 border-t border-border">
        <button className="text-sm text-secondary-500 hover:text-secondary-600 font-medium transition-apple">
          View all alerts
        </button>
      </div>
    </div>
  );
};
