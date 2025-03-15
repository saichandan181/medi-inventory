
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddPurchaseOrderDialog } from "@/components/purchaseOrders/AddPurchaseOrderDialog";

const PurchaseOrders = () => {
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  // Fetch purchase orders from the database
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          id,
          reference_number,
          order_date,
          expected_delivery_date,
          status,
          total_amount,
          suppliers(name)
        `)
        .order('order_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching purchase orders:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    }
  });

  const handleOrderCreated = () => {
    refetch();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case 'received':
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case 'cancelled':
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Purchase Orders"
        description="Manage your purchase orders"
        actions={
          <Button onClick={() => setIsAddOrderOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        }
      />

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">Loading purchase orders...</div>
          ) : orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.reference_number}</TableCell>
                    <TableCell>{order.suppliers?.name || 'N/A'}</TableCell>
                    <TableCell>{order.order_date ? format(new Date(order.order_date), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                    <TableCell>{format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getStatusBadgeClass(order.status)}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>${Number(order.total_amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No purchase orders found
            </div>
          )}
        </div>
      </div>

      <AddPurchaseOrderDialog
        open={isAddOrderOpen}
        onOpenChange={setIsAddOrderOpen}
        onOrderCreated={handleOrderCreated}
      />
    </MainLayout>
  );
};

export default PurchaseOrders;
