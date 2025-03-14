
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getMedicines, type Medicine } from "@/services/inventoryService";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const Medicines = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: getMedicines
  });

  const filteredMedicines = medicines?.filter(medicine => 
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <PageHeader 
        title="Medicines" 
        description="Manage your medicine inventory"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Medicine
            </Button>
          </div>
        }
      />

      {/* Search and filter bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search medicines..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Medicines table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">Loading medicines...</div>
          ) : filteredMedicines && filteredMedicines.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>In Stock</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-muted-foreground">{medicine.generic_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{medicine.category}</TableCell>
                    <TableCell>
                      <div className="font-medium">{medicine.stock_quantity}</div>
                      <div className="text-xs text-muted-foreground">Min: {medicine.reorder_level}</div>
                    </TableCell>
                    <TableCell>${medicine.unit_price.toFixed(2)}</TableCell>
                    <TableCell>
                      {medicine.expiry_date ? format(new Date(medicine.expiry_date), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          medicine.stock_quantity <= medicine.reorder_level
                            ? "bg-accent-500/10 text-accent-500 border-accent-500/20"
                            : "bg-green-500/10 text-green-500 border-green-500/20"
                        }
                      >
                        {medicine.stock_quantity <= medicine.reorder_level ? "Low Stock" : "In Stock"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No medicines found
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Medicines;
