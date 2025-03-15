
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from './types';

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

  // Fetch invoice data within date range
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, invoice_date, total_amount, invoice_items(quantity)')
    .gte('invoice_date', startStr)
    .lte('invoice_date', endStr)
    .order('invoice_date');

  if (error) {
    console.error('Error fetching sales data:', error);
    throw new Error(error.message);
  }

  // Process data based on period type
  return aggregateInvoicesByPeriod(invoices, periodType);
};

const aggregateInvoicesByPeriod = (
  invoices: any[],
  periodType: PeriodType
): SalesReportData[] => {
  const periodsMap = new Map<string, SalesReportData>();

  invoices.forEach(invoice => {
    const date = new Date(invoice.invoice_date);
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
    periodData.totalSales += invoice.total_amount || 0;
    
    // Calculate total items sold from invoice_items
    const itemsSold = invoice.invoice_items ? 
      invoice.invoice_items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) : 0;
    
    periodData.itemsSold += itemsSold;

    // Store updated period data
    periodsMap.set(periodKey, periodData);
  });

  // If no sales data, return empty array
  if (periodsMap.size === 0) {
    return [];
  }

  // Convert map to array and sort by period
  return Array.from(periodsMap.values()).sort((a, b) => a.period.localeCompare(b.period));
};
