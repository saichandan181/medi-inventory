
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceWithItems } from "@/services/inventoryService";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { format } from "date-fns";
import { InvoicePrintView } from "@/components/invoices/InvoicePrintView";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const InvoiceDetail = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => getInvoiceWithItems(invoiceId!),
    enabled: !!invoiceId
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice_${data?.invoice.invoice_number}`,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8 text-center">Loading invoice details...</div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center p-8 text-center">
          <div className="text-accent-500 mb-4">Error loading invoice.</div>
          <Button onClick={() => navigate("/invoices")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </div>
      </MainLayout>
    );
  }

  const { invoice, items } = data;

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate("/invoices")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Invoice: {invoice.invoice_number}</h1>
            <p className="text-muted-foreground">
              {format(new Date(invoice.invoice_date), 'PPP')}
            </p>
          </div>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      <div className="hidden">
        <div ref={printRef}>
          <InvoicePrintView invoice={invoice} items={items} />
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden p-6">
        <InvoicePrintView invoice={invoice} items={items} />
      </div>
    </MainLayout>
  );
};

export default InvoiceDetail;
