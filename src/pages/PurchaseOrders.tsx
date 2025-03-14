
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plus } from "lucide-react";

const PurchaseOrders = () => {
  // Placeholder for purchase orders - in real implementation, fetch from API
  const orders = [
    {
      id: "1",
      reference: "PO-2023-001",
      supplier: "PharmaTech Solutions",
      date: new Date(2023, 9, 15),
      expectedDelivery: new Date(2023, 9, 25),
      status: "pending",
      total: 1250.50
    },
    {
      id: "2",
      reference: "PO-2023-002",
      supplier: "MediSupply Co.",
      date: new Date(2023, 9, 10),
      expectedDelivery: new Date(2023, 9, 20),
      status: "received",
      total: 890.75
    },
    {
      id: "3",
      reference: "PO-2023-003",
      supplier: "Global Pharmaceuticals",
      date: new Date(2023, 9, 5),
      expectedDelivery: new Date(2023, 9, 15),
      status: "cancelled",
      total: 450.00
    }
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Purchase Orders"
        description="Manage your purchase orders"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        }
      />

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
                  <TableCell className="font-medium">{order.reference}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{format(order.date, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(order.expectedDelivery, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        order.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : order.status === "received"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                      }
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default PurchaseOrders;
