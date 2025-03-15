
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  Activity, 
  Calendar, 
  Layers,
  AlertTriangle,
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobileView: boolean;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active?: boolean;
  hasSubItems?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  subItems?: { label: string; to: string; active?: boolean }[];
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  to, 
  active = false, 
  hasSubItems = false,
  isExpanded = false,
  onToggleExpand,
  subItems = []
}: NavItemProps) => {
  return (
    <>
      <Link
        to={to}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-apple group",
          active 
            ? "bg-secondary-500/10 text-secondary-500" 
            : "text-foreground/70 hover:bg-secondary-500/5 hover:text-secondary-500"
        )}
        onClick={hasSubItems ? (e) => {
          e.preventDefault();
          onToggleExpand?.();
        } : undefined}
      >
        <Icon size={18} className={cn("transition-apple", active ? "text-secondary-500" : "text-muted-foreground group-hover:text-secondary-500")} />
        <span className="flex-1">{label}</span>
        {hasSubItems && (
          isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        )}
      </Link>
      
      {hasSubItems && isExpanded && (
        <div className="ml-6 mt-1 space-y-1 animate-slideIn">
          {subItems.map((subItem, i) => (
            <Link
              key={i}
              to={subItem.to}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-apple",
                subItem.active 
                  ? "bg-secondary-500/10 text-secondary-500" 
                  : "text-foreground/70 hover:bg-secondary-500/5 hover:text-secondary-500"
              )}
            >
              <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2"></span>
              {subItem.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export const Sidebar = ({ isOpen, onClose, isMobileView }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (item: string) => {
    setExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item) 
        : [...prev, item]
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileView && isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20" 
          onClick={onClose}
        />
      )}
      
      <aside 
        className={cn(
          "w-64 bg-card border-r border-border flex flex-col z-30 transition-all duration-300 ease-in-out",
          isMobileView 
            ? isOpen 
              ? "fixed inset-y-0 left-0" 
              : "fixed inset-y-0 -left-64" 
            : isOpen 
              ? "relative translate-x-0" 
              : "relative -translate-x-64 hidden"
        )}
      >
        <div className="p-4 border-b border-border flex justify-between items-center lg:hidden">
          <span className="font-inter font-bold">MedInventory360</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Dashboard */}
          <div className="space-y-1">
            <NavItem 
              icon={Home} 
              label="Dashboard" 
              to="/" 
              active 
            />
          </div>
          
          {/* Inventory */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Inventory
            </p>
            <NavItem 
              icon={Package} 
              label="Medicines" 
              to="/medicines"
              hasSubItems
              isExpanded={expandedItems.includes('medicines')}
              onToggleExpand={() => toggleExpand('medicines')}
              subItems={[
                { label: "All Medicines", to: "/medicines" },
                { label: "Add New", to: "/medicines" },
                { label: "Categories", to: "/medicines/categories" },
              ]}
            />
            <NavItem 
              icon={AlertTriangle} 
              label="Low Stock" 
              to="/low-stock" 
            />
            <NavItem 
              icon={Calendar} 
              label="Expiry Tracking" 
              to="/expiry-tracking" 
            />
          </div>
          
          {/* Suppliers */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Suppliers
            </p>
            <NavItem 
              icon={Users} 
              label="All Suppliers" 
              to="/suppliers" 
            />
            <NavItem 
              icon={Layers} 
              label="Purchase Orders" 
              to="/purchase-orders" 
            />
          </div>
          
          {/* Reports */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reports
            </p>
            <NavItem 
              icon={BarChart3} 
              label="Analytics" 
              to="/analytics" 
            />
            <NavItem 
              icon={Activity} 
              label="Stock History" 
              to="/stock-history" 
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="space-y-1">
            <NavItem 
              icon={Settings} 
              label="Settings" 
              to="/settings" 
            />
            <NavItem 
              icon={LogOut} 
              label="Logout" 
              to="/logout" 
            />
          </div>
        </div>
      </aside>
    </>
  );
};
