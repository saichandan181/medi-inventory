
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Download, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from 'xlsx';

interface DailyTransaction {
  date: string;
  total_sales: number;
  total_invoices: number;
}

interface DetailedTransaction {
  id: string;
  invoice_number: string;
  customer_name: string;
  invoice_date: string;
  payment_type: string;
  grand_total: number;
}

const getDailyReport = async (date: Date): Promise<{ summary: DailyTransaction, details: DetailedTransaction[] }> => {
  const dayStart = startOfDay(date).toISOString();
  const dayEnd = endOfDay(date).toISOString();
  
  // Get invoices for the selected day
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .gte('invoice_date', dayStart)
    .lte('invoice_date', dayEnd)
    .order('invoice_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching daily report:', error);
    throw new Error(error.message);
  }
  
  // Calculate summary
  const totalSales = invoices?.reduce((sum, invoice) => sum + (invoice.grand_total || 0), 0) || 0;
  
  const summary: DailyTransaction = {
    date: format(date, 'yyyy-MM-dd'),
    total_sales: totalSales,
    total_invoices: invoices?.length || 0
  };
  
  const details: DetailedTransaction[] = invoices?.map(invoice => ({
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    customer_name: invoice.customer_name,
    invoice_date: format(new Date(invoice.invoice_date), 'yyyy-MM-dd HH:mm'),
    payment_type: invoice.payment_type,
    grand_total: invoice.grand_total
  })) || [];
  
  return { summary, details };
};

const DailyReports = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data, isLoading } = useQuery({
    queryKey: ['dailyReport', date.toISOString().split('T')[0]],
    queryFn: () => getDailyReport(date)
  });
  
  const summary = data?.summary;
  
  const filteredDetails = data?.details.filter(detail => 
    detail.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const exportToExcel = () => {
    if (!data) return;
    
    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(filteredDetails);
    
    // Add summary information at the top
    XLSX.utils.sheet_add_aoa(ws, [
      [`Daily Report for ${format(date, 'PPP')}`],
      [`Total Sales: ₹${summary?.total_sales.toFixed(2)}`],
      [`Total Invoices: ${summary?.total_invoices}`],
      [''], // Empty row
      ['Invoice Number', 'Customer', 'Date', 'Payment Type', 'Amount']
    ], { origin: 'A1' });
    
    // Create workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');
    
    // Generate download
    XLSX.writeFile(wb, `Daily_Report_${format(date, 'yyyy-MM-dd')}.xlsx`);
  };
  
  return (
    <MainLayout>
      <PageHeader 
        title="Daily Reports" 
        description="View and export daily transaction reports"
        actions={
          <Button onClick={exportToExcel} disabled={!data || data.details.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <span className="text-muted-foreground text-sm">Loading...</span>
              ) : (
                `₹${summary?.total_sales.toFixed(2) || '0.00'}`
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <span className="text-muted-foreground text-sm">Loading...</span>
              ) : (
                summary?.total_invoices || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search invoices..." 
            className="pl-8 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">Loading transactions...</div>
          ) : filteredDetails.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDetails.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell className="font-medium">{detail.invoice_number}</TableCell>
                    <TableCell>{detail.customer_name}</TableCell>
                    <TableCell>{detail.invoice_date}</TableCell>
                    <TableCell className="capitalize">{detail.payment_type}</TableCell>
                    <TableCell className="text-right">₹{detail.grand_total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No transactions found for this date
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DailyReports;
