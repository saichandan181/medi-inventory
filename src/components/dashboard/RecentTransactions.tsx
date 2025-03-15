
import { useQuery } from '@tanstack/react-query';
import { getRecentTransactions } from '@/services/inventoryService';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Activity, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentTransactionsProps {
  onNewTransaction?: () => void;
}

export const RecentTransactions = ({ onNewTransaction }: RecentTransactionsProps) => {
  const navigate = useNavigate();
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: () => getRecentTransactions(5)
  });

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'sale':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'return':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'adjustment':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-secondary-500/10 text-secondary-500 border-secondary-500/20';
    }
  };

  const getFormattedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-soft overflow-hidden transition-apple hover:shadow-md">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-secondary-500" />
          <h3 className="font-medium">Recent Transactions</h3>
        </div>
        <Button 
          className="bg-secondary-500 hover:bg-secondary-600" 
          size="sm"
          onClick={onNewTransaction}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          New Transaction
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-6 text-center">Loading transactions...</div>
        ) : error ? (
          <div className="p-6 text-center text-accent-500">Error loading transactions</div>
        ) : transactions && transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.medicine?.name || 'Unknown medicine'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTransactionTypeColor(transaction.type)}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>{getFormattedDate(transaction.created_at)}</TableCell>
                  <TableCell className="text-right">₹{transaction.total_price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 text-center text-muted-foreground">No recent transactions</div>
        )}
      </div>
      
      <div className="px-5 py-3 border-t border-border">
        <Button 
          variant="ghost" 
          className="text-sm text-secondary-500 hover:text-secondary-600 font-medium"
          onClick={() => navigate('/invoices')}
        >
          View all transactions
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
