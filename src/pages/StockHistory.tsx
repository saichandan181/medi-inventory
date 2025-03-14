
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getRecentTransactions } from "@/services/inventoryService";

const StockHistory = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => getRecentTransactions(100) // Get up to 100 transactions
  });

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'purchase':
        return { label: 'Purchase', variant: 'green' };
      case 'sale':
        return { label: 'Sale', variant: 'blue' };
      case 'return':
        return { label: 'Return', variant: 'yellow' };
      case 'adjustment':
        return { label: 'Adjustment', variant: 'orange' };
      default:
        return { label: type, variant: 'default' };
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Stock History"
        description="Track all stock movements and transactions"
      />

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">Loading transactions...</div>
          ) : transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const typeInfo = getTransactionTypeDisplay(transaction.type);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(new Date(transaction.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            typeInfo.variant === 'green'
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : typeInfo.variant === 'blue'
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : typeInfo.variant === 'yellow'
                                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                  : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                          }
                        >
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.medicine?.name || 'Unknown'}</TableCell>
                      <TableCell className={transaction.quantity < 0 ? "text-red-500" : ""}>{transaction.quantity}</TableCell>
                      <TableCell>${transaction.unit_price.toFixed(2)}</TableCell>
                      <TableCell>${transaction.total_price.toFixed(2)}</TableCell>
                      <TableCell>{transaction.reference_number || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No transactions found
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default StockHistory;
