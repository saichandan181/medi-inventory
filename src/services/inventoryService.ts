
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

// Mock data for Invoice functions since the tables don't exist yet
// These functions will need to be updated once the tables are created in Supabase

export const createInvoice = async (
  invoice: Omit<Invoice, 'id' | 'created_at'>, 
  invoiceItems: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
): Promise<{ invoice: Invoice, items: InvoiceItem[] }> => {
  // This is a mock implementation until the Supabase tables are created
  console.log('Creating invoice:', invoice);
  console.log('Invoice items:', invoiceItems);
  
  // Generate a mock response
  const mockInvoice: Invoice = {
    id: `mock-${Date.now()}`,
    ...invoice,
    created_at: new Date().toISOString(),
  };
  
  const mockItems: InvoiceItem[] = invoiceItems.map((item, index) => ({
    id: `mock-item-${Date.now()}-${index}`,
    invoice_id: mockInvoice.id,
    ...item
  }));
  
  return {
    invoice: mockInvoice,
    items: mockItems
  };
};

export const getInvoiceWithItems = async (
  invoiceId: string
): Promise<{ invoice: Invoice, items: InvoiceItem[] }> => {
  // This is a mock implementation until the Supabase tables are created
  
  // Mock invoice data
  const mockInvoice: Invoice = {
    id: invoiceId,
    invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    invoice_date: new Date().toISOString(),
    customer_name: "Sample Customer",
    customer_address: "123 Sample Street",
    customer_gstin: "GSTIN12345678",
    customer_dl_number: "DL-12345",
    customer_pan: "PANABCD1234E",
    total_amount: 5000,
    total_tax: 900,
    grand_total: 5900,
    payment_type: 'cash',
    notes: "",
    created_at: new Date().toISOString(),
    created_by: "user-123"
  };
  
  // Mock invoice items
  const mockItems: InvoiceItem[] = [
    {
      id: `item-1-${invoiceId}`,
      invoice_id: invoiceId,
      medicine_id: "med-123",
      batch_number: "B12345",
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      hsn_code: "HSN123",
      quantity: 10,
      free_quantity: 1,
      discount_percentage: 5,
      mrp: 100,
      rate: 90,
      gst_percentage: 18,
      gst_amount: 162,
      total_amount: 1062,
      medicine: {
        name: "Paracetamol",
        manufacturer: "Sample Pharma"
      }
    },
    {
      id: `item-2-${invoiceId}`,
      invoice_id: invoiceId,
      medicine_id: "med-456",
      batch_number: "B6789",
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
      hsn_code: "HSN456",
      quantity: 20,
      free_quantity: 2,
      discount_percentage: 10,
      mrp: 200,
      rate: 180,
      gst_percentage: 12,
      gst_amount: 432,
      total_amount: 4032,
      medicine: {
        name: "Amlodipine",
        manufacturer: "Health Pharma"
      }
    }
  ];
  
  return {
    invoice: mockInvoice,
    items: mockItems
  };
};

export const getRecentInvoices = async (limit = 5): Promise<Invoice[]> => {
  // This is a mock implementation until the Supabase tables are created
  
  // Generate mock invoices
  const mockInvoices: Invoice[] = Array.from({ length: limit }).map((_, i) => ({
    id: `mock-inv-${i}`,
    invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    invoice_date: new Date(Date.now() - i * 86400000).toISOString(), // Each one day apart
    customer_name: `Customer ${i + 1}`,
    customer_address: `Address ${i + 1}`,
    customer_gstin: i % 2 === 0 ? `GSTIN${1000 + i}` : undefined,
    customer_dl_number: i % 3 === 0 ? `DL-${2000 + i}` : undefined,
    customer_pan: i % 2 === 1 ? `PAN${3000 + i}` : undefined,
    total_amount: 1000 * (i + 1),
    total_tax: 180 * (i + 1),
    grand_total: 1180 * (i + 1),
    payment_type: i % 2 === 0 ? 'cash' : 'credit',
    notes: i % 3 === 0 ? "Some notes" : "",
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    created_by: "user-123"
  }));
  
  return mockInvoices;
};

