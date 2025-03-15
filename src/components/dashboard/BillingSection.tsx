
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, DollarSign, FilePlus, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getRecentInvoices } from '@/services/inventoryService';
import { NewInvoiceDialog } from '@/components/invoices/NewInvoiceDialog';

export const BillingSection = () => {
  const [openNewInvoiceDialog, setOpenNewInvoiceDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: invoices } = useQuery({
    queryKey: ['recentInvoices'],
    queryFn: () => getRecentInvoices(3)
  });

  const totalBilledAmount = invoices?.reduce((total, invoice) => total + invoice.grand_total, 0) || 0;
  const completedInvoices = invoices?.filter(invoice => invoice.payment_type === 'cash').length || 0;

  const handleCreateInvoice = () => {
    setOpenNewInvoiceDialog(true);
  };

  const handleViewAllInvoices = () => {
    navigate('/invoices');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Billing & Invoices</h2>
        <Button onClick={handleCreateInvoice}>
          <FilePlus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <DashboardCard
          title="Total Billed"
          value={`₹${totalBilledAmount.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5 text-secondary-500" />}
        />
        <DashboardCard
          title="Completed Invoices"
          value={completedInvoices.toString()}
          icon={<FileText className="h-5 w-5 text-accent-500" />}
        />
        <Card className="bg-secondary-50 dark:bg-secondary-900/20 border-none shadow-soft">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-secondary-700 dark:text-secondary-200">Quick Invoice Lookup</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-search">Invoice Number</Label>
              <Input
                id="invoice-search"
                placeholder="Enter invoice number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleViewAllInvoices}
              disabled={!searchQuery}
            >
              Search
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          className="text-sm text-secondary-500 hover:text-secondary-600" 
          onClick={handleViewAllInvoices}
        >
          View all invoices
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <NewInvoiceDialog open={openNewInvoiceDialog} onOpenChange={setOpenNewInvoiceDialog} />
    </div>
  );
};
