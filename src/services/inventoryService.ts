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

// Type for creating a new medicine that accepts Date for expiry_date
export type CreateMedicineInput = Omit<Medicine, 'id' | 'created_at' | 'updated_at' | 'expiry_date'> & {
  expiry_date: Date;
};

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

// New Invoice interface
export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  supplier_id?: string;
  customer_name: string;
  customer_gstin?: string;
  customer_address?: string;
  customer_dl_number?: string;
  customer_pan?: string;
  total_amount: number;
  total_tax: number;
  grand_total: number;
  payment_type: 'cash' | 'credit';
  notes?: string;
  created_at: string;
  created_by: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  medicine_id: string;
  batch_number: string;
  expiry_date: string;
  hsn_code: string;
  quantity: number;
  free_quantity: number;
  discount_percentage: number;
  mrp: number;
  rate: number;
  gst_percentage: number;
  gst_amount: number;
  total_amount: number;
  medicine?: {
    name: string;
    manufacturer: string;
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

export const createMedicine = async (medicine: CreateMedicineInput): Promise<Medicine> => {
  // Convert Date object to ISO string for Supabase
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
  
  // Ensure the data matches our Transaction type
  const typedData = data?.map(item => ({
    ...item,
    type: item.type as 'purchase' | 'sale' | 'return' | 'adjustment'
  })) || [];
  
  return typedData;
};

// Low stock medicines
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

// Expiring medicines
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

// Invoice operations
export const createInvoice = async (
  invoice: Omit<Invoice, 'id' | 'created_at'>, 
  invoiceItems: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
): Promise<{ invoice: Invoice, items: InvoiceItem[] }> => {
  // Insert the invoice record
  const { data: insertedInvoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();
    
  if (invoiceError) {
    console.error('Error creating invoice:', invoiceError);
    throw new Error(invoiceError.message);
  }
  
  // Prepare invoice items with the invoice_id
  const itemsWithInvoiceId = invoiceItems.map(item => ({
    ...item,
    invoice_id: insertedInvoice.id
  }));
  
  // Insert the invoice items
  const { data: insertedItems, error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsWithInvoiceId)
    .select(`
      *,
      medicine:medicine_id (
        name,
        manufacturer
      )
    `);
    
  if (itemsError) {
    console.error('Error creating invoice items:', itemsError);
    throw new Error(itemsError.message);
  }
  
  return {
    invoice: insertedInvoice,
    items: insertedItems as InvoiceItem[]
  };
};

export const getInvoiceWithItems = async (
  invoiceId: string
): Promise<{ invoice: Invoice, items: InvoiceItem[] }> => {
  // Fetch the invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();
    
  if (invoiceError) {
    console.error(`Error fetching invoice with ID ${invoiceId}:`, invoiceError);
    throw new Error(invoiceError.message);
  }
  
  // Fetch the invoice items
  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select(`
      *,
      medicine:medicine_id (
        name,
        manufacturer
      )
    `)
    .eq('invoice_id', invoiceId);
    
  if (itemsError) {
    console.error(`Error fetching items for invoice with ID ${invoiceId}:`, itemsError);
    throw new Error(itemsError.message);
  }
  
  return {
    invoice: invoice as Invoice,
    items: items as InvoiceItem[]
  };
};

export const getRecentInvoices = async (limit = 100): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('invoice_date', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Error fetching invoices:', error);
    throw new Error(error.message);
  }
  
  return data as Invoice[];
};
