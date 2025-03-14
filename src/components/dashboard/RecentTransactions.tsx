
import { Package, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for recent transactions
const transactions = [
  { 
    id: 1, 
    type: "in", 
    name: "Amoxicillin 500mg", 
    quantity: 200, 
    supplier: "PharmaCorp Inc.", 
    date: "Today, 10:23 AM" 
  },
  { 
    id: 2, 
    type: "out", 
    name: "Ibuprofen 400mg", 
    quantity: 50, 
    department: "Emergency Ward", 
    date: "Today, 09:15 AM" 
  },
  { 
    id: 3, 
    type: "in", 
    name: "Metformin 500mg", 
    quantity: 300, 
    supplier: "MediSupply Co.", 
    date: "Yesterday, 02:45 PM" 
  },
  { 
    id: 4, 
    type: "out", 
    name: "Salbutamol Inhaler", 
    quantity: 25, 
    department: "Respiratory Unit", 
    date: "Yesterday, 11:30 AM" 
  },
];

export const RecentTransactions = () => {
  return (
    <div className="bg-card rounded-xl shadow-soft overflow-hidden transition-apple hover:shadow-md h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-primary-500" />
          <h3 className="font-medium">Recent Transactions</h3>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-border">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-4 hover:bg-muted/30 transition-apple">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  transaction.type === "in" 
                    ? "bg-green-100 dark:bg-green-900/30" 
                    : "bg-accent-100 dark:bg-accent-900/30"
                )}>
                  {transaction.type === "in" 
                    ? <ArrowDown size={16} className="text-green-600 dark:text-green-400" /> 
                    : <ArrowUp size={16} className="text-accent-600 dark:text-accent-400" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-sm font-medium">{transaction.quantity} units</p>
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-muted-foreground">
                      {transaction.type === "in" ? "From: " + transaction.supplier : "To: " + transaction.department}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="px-5 py-3 border-t border-border mt-auto">
        <button className="text-sm text-secondary-500 hover:text-secondary-600 font-medium transition-apple">
          View all transactions
        </button>
      </div>
    </div>
  );
};
