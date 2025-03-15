
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from './inventoryService';

export type PeriodType = 'daily' | 'monthly' | 'yearly';

export interface SalesReportData {
  period: string;
  totalSales: number;
  itemsSold: number;
}

export const getSalesReport = async (
  periodType: PeriodType,
  startDate?: Date,
  endDate?: Date
): Promise<SalesReportData[]> => {
  // Default end date to today if not provided
  const end = endDate || new Date();
  
  // Default start date based on period if not provided
  let start = startDate;
  if (!start) {
    start = new Date(end);
    if (periodType === 'daily') {
      // Last 30 days
      start.setDate(end.getDate() - 30);
    } else if (periodType === 'monthly') {
      // Last 12 months
      start.setMonth(end.getMonth() - 12);
    } else {
      // Last 5 years
      start.setFullYear(end.getFullYear() - 5);
    }
  }

  // Format dates for query
  const startStr = start.toISOString();
  const endStr = end.toISOString();

  // Get transactions within date range
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('type', 'sale')
    .gte('created_at', startStr)
    .lte('created_at', endStr)
    .order('created_at');

  if (error) {
    console.error('Error fetching sales data:', error);
    throw new Error(error.message);
  }

  // Process data based on period type
  // Cast the raw data to the correct Transaction type
  const typedTransactions = (transactions || []).map(tx => ({
    ...tx,
    type: tx.type as 'sale' | 'purchase' | 'return' | 'adjustment'
  })) as Transaction[];
  
  return aggregateTransactionsByPeriod(typedTransactions, periodType);
};

const aggregateTransactionsByPeriod = (
  transactions: Transaction[],
  periodType: PeriodType
): SalesReportData[] => {
  const periodsMap = new Map<string, SalesReportData>();

  transactions.forEach(transaction => {
    const date = new Date(transaction.created_at);
    let periodKey: string;

    // Format period key based on period type
    if (periodType === 'daily') {
      periodKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (periodType === 'monthly') {
      periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    } else {
      periodKey = `${date.getFullYear()}`; // YYYY
    }

    // Get existing period data or create new one
    const periodData = periodsMap.get(periodKey) || {
      period: periodKey,
      totalSales: 0,
      itemsSold: 0
    };

    // Update period data
    periodData.totalSales += transaction.total_price;
    periodData.itemsSold += transaction.quantity;

    // Store updated period data
    periodsMap.set(periodKey, periodData);
  });

  // Convert map to array and sort by period
  return Array.from(periodsMap.values()).sort((a, b) => a.period.localeCompare(b.period));
};
