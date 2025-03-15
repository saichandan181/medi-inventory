
import { useState, useEffect } from "react";
import { Menu, X, Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "./UserProfileMenu";
import { useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Check if mobile view on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to medicines page with search query
      navigate(`/medicines?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-card/50 backdrop-blur-sm z-20">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="lg:hidden transition-apple hover:bg-secondary-100/20 dark:hover:bg-secondary-900/20"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <div className="ml-4 lg:ml-0 flex items-center gap-2">
            <span className="font-inter font-bold text-xl">MedInventory<span className="text-secondary-500">360</span></span>
          </div>
        </div>
        <form onSubmit={handleSearch} className="hidden md:flex items-center px-2 py-1 rounded-full bg-muted/80">
          <Search size={16} className="text-muted-foreground mr-2" />
          <input 
            type="text" 
            placeholder="Search medicines, suppliers..." 
            className="bg-transparent border-none outline-none text-sm w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="transition-apple hover:bg-secondary-100/20 dark:hover:bg-secondary-900/20">
            <Bell size={20} className="text-primary-300" />
          </Button>
          <ThemeToggle />
          <UserProfileMenu />
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile by default */}
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} isMobileView={isMobileView} />

        {/* Main content */}
        <main 
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out p-4 md:p-6",
            isMobileView && isSidebarOpen ? "blur-sm" : ""
          )}
          onClick={() => isMobileView && isSidebarOpen && setIsSidebarOpen(false)}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
