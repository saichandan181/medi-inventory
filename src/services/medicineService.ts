
import { supabase } from '@/integrations/supabase/client';
import { Medicine, CreateMedicineInput } from './types';

export const getMedicines = async (): Promise<Medicine[]> => {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching medicines:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

export const getMedicineById = async (id: string): Promise<Medicine | null> => {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Error fetching medicine with ID ${id}:`, error);
    throw new Error(error.message);
  }
  
  return data;
};

export const createMedicine = async (medicine: CreateMedicineInput): Promise<Medicine> => {
  const formattedMedicine = {
    ...medicine,
    expiry_date: medicine.expiry_date.toISOString().split('T')[0]
  };
  
  const { data, error } = await supabase
    .from('medicines')
    .insert([formattedMedicine])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating medicine:', error);
    throw new Error(error.message);
  }
  
  return data;
};

export const updateMedicine = async (id: string, medicine: Partial<Medicine>): Promise<Medicine> => {
  const { data, error } = await supabase
    .from('medicines')
    .update({ ...medicine, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Error updating medicine with ID ${id}:`, error);
    throw new Error(error.message);
  }
  
  return data;
};

export const deleteMedicine = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('medicines')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Error deleting medicine with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

export const getLowStockMedicines = async (): Promise<Medicine[]> => {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .lt('stock_quantity', 'reorder_level')
    .order('name');
    
  if (error) {
    console.error('Error fetching low stock medicines:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

export const getExpiringMedicines = async (daysThreshold = 30): Promise<Medicine[]> => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .lt('expiry_date', thresholdDate.toISOString().split('T')[0])
    .gt('expiry_date', new Date().toISOString().split('T')[0])
    .order('expiry_date');
    
  if (error) {
    console.error('Error fetching expiring medicines:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};
