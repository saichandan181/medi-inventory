
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Search, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getRecentInvoices } from "@/services/inventoryService";
import { format } from "date-fns";
import { NewInvoiceDialog } from "@/components/invoices/NewInvoiceDialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openNewInvoiceDialog, setOpenNewInvoiceDialog] = useState(false);
  const navigate = useNavigate();

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => getRecentInvoices(100)
  });

  const filteredInvoices = invoices?.filter(invoice => 
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Invoices" 
        description="Generate and manage GST invoices"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setOpenNewInvoiceDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        }
      />

      {/* Search and filter bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Invoices table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">Loading invoices...</div>
          ) : error ? (
            <div className="p-8 text-center text-accent-500">Error loading invoices.</div>
          ) : filteredInvoices && filteredInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          invoice.payment_type === 'credit'
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : "bg-green-500/10 text-green-500 border-green-500/20"
                        }
                      >
                        {invoice.payment_type === 'credit' ? 'Credit' : 'Completed'}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{invoice.grand_total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice.id)}>
                        <Printer className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No invoices found. Create your first invoice.
            </div>
          )}
        </div>
      </div>

      <NewInvoiceDialog open={openNewInvoiceDialog} onOpenChange={setOpenNewInvoiceDialog} />
    </MainLayout>
  );
};

export default Invoices;
