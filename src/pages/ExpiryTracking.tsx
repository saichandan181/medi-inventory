
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getExpiringMedicines } from "@/services/inventoryService";
import { Clock, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

const ExpiryTracking = () => {
  const { data: expiringItems, isLoading } = useQuery({
    queryKey: ['expiringMedicines'],
    queryFn: () => getExpiringMedicines(90) // Get items expiring in the next 90 days
  });

  const getDaysLeft = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.max(0, differenceInDays(expiry, today));
  };

  const getExpiryStatus = (daysLeft: number) => {
    if (daysLeft <= 0) return { label: "Expired", className: "bg-accent-500/10 text-accent-500 border-accent-500/20" };
    if (daysLeft <= 30) return { label: "Critical", className: "bg-accent-500/10 text-accent-500 border-accent-500/20" };
    if (daysLeft <= 60) return { label: "Warning", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" };
    return { label: "Upcoming", className: "bg-secondary-500/10 text-secondary-500 border-secondary-500/20" };
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Expiry Tracking" 
        description="Monitor medicines approaching their expiry dates"
        actions={
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* Expiring items table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">Loading expiring items...</div>
          ) : expiringItems && expiringItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringItems.map((item) => {
                  const daysLeft = getDaysLeft(item.expiry_date);
                  const status = getExpiryStatus(daysLeft);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.generic_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.batch_number || 'N/A'}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{format(new Date(item.expiry_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="font-medium">{daysLeft} days</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No expiring items found in the next 90 days
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ExpiryTracking;
