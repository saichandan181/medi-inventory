
import { supabase } from '@/integrations/supabase/client';

// Define types for our data models
export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  manufacturer: string;
  category: string;
  batch_number: string;
  expiry_date: string;
  stock_quantity: number;
  unit_price: number;
  reorder_level: number;
  storage_condition: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'return' | 'adjustment';
  medicine_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  reference_number?: string;
  supplier_id?: string;
  notes?: string;
  created_at: string;
  created_by: string;
  // Add medicine relation to match joined data from Supabase
  medicine?: {
    name: string;
  };
}

// Medicine operations
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

export const createMedicine = async (medicine: Omit<Medicine, 'id' | 'created_at' | 'updated_at'>): Promise<Medicine> => {
  const { data, error } = await supabase
    .from('medicines')
    .insert([{ ...medicine }])
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

// Supplier operations
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

// Transaction operations
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
  
  return data || [];
};

// Dashboard stats
export const getDashboardStats = async () => {
  const [medicinesResult, suppliersResult, lowStockResult, pendingOrdersResult] = await Promise.all([
    supabase.from('medicines').select('count').single(),
    supabase.from('suppliers').select('count').single(),
    supabase.from('medicines').select('count').lt('stock_quantity', 'reorder_level').single(),
    supabase.from('purchase_orders').select('count').eq('status', 'pending').single()
  ]);
  
  return {
    totalInventory: medicinesResult.data?.count || 0,
    totalSuppliers: suppliersResult.data?.count || 0,
    lowStockItems: lowStockResult.data?.count || 0,
    pendingOrders: pendingOrdersResult.data?.count || 0
  };
};
