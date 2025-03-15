
import { supabase } from '@/integrations/supabase/client';
import { Supplier } from './types';

export const getSuppliers = async (): Promise<Supplier[]> => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching suppliers:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

export const createSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> => {
  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplier])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating supplier:', error);
    throw new Error(error.message);
  }
  
  return data;
};

export const updateSupplier = async (id: string, supplier: Partial<Supplier>): Promise<Supplier> => {
  const { data, error } = await supabase
    .from('suppliers')
    .update({ ...supplier, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Error updating supplier with ID ${id}:`, error);
    throw new Error(error.message);
  }
  
  return data;
};

export const deleteSupplier = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Error deleting supplier with ID ${id}:`, error);
    throw new Error(error.message);
  }
};
