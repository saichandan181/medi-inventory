
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
  medicine?: {
    name: string;
  };
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  supplier_id?: string;
  customer_name: string;
  customer_phone?: string;
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
