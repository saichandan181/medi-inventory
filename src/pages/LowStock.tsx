
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getLowStockMedicines, type Medicine } from "@/services/inventoryService";
import { AlertTriangle, Plus, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const LowStock = () => {
  const { data: lowStockItems, isLoading } = useQuery({
    queryKey: ['lowStockMedicines'],
    queryFn: getLowStockMedicines
  });

  return (
    <MainLayout>
      <PageHeader 
        title="Low Stock Items" 
        description="Medicines that need to be restocked soon"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </div>
        }
      />

      {/* Low stock items table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">Loading low stock items...</div>
          ) : lowStockItems && lowStockItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.generic_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="font-medium">{item.stock_quantity}</TableCell>
                    <TableCell>{item.reorder_level}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          item.stock_quantity === 0
                            ? "bg-accent-500/10 text-accent-500 border-accent-500/20"
                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        }
                      >
                        {item.stock_quantity === 0 ? "Out of Stock" : "Low Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <AlertTriangle className="mr-2 h-3 w-3" />
                        Order Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No low stock items found
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default LowStock;
