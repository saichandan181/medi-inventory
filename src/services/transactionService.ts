
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from './types';

export const getRecentTransactions = async (limit = 5): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, medicine:medicine_id(name)')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Error fetching recent transactions:', error);
    throw new Error(error.message);
  }
  
  const typedData = data?.map(item => ({
    ...item,
    type: item.type as 'purchase' | 'sale' | 'return' | 'adjustment'
  })) || [];
  
  return typedData;
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating transaction:', error);
    throw new Error(error.message);
  }
  
  return {
    ...data,
    type: data.type as 'purchase' | 'sale' | 'return' | 'adjustment'
  };
};
