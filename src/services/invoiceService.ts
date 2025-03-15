
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceItem } from './types';

export const createInvoice = async (
  invoice: Omit<Invoice, 'id' | 'created_at'>, 
  invoiceItems: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
): Promise<{ invoice: Invoice, items: InvoiceItem[] }> => {
  const { data: insertedInvoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();
    
  if (invoiceError) {
    console.error('Error creating invoice:', invoiceError);
    throw new Error(invoiceError.message);
  }
  
  const itemsWithInvoiceId = invoiceItems.map(item => ({
    ...item,
    invoice_id: insertedInvoice.id
  }));
  
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
  
  const typedInvoice = {
    ...insertedInvoice,
    payment_type: insertedInvoice.payment_type as 'cash' | 'credit'
  };
  
  return {
    invoice: typedInvoice as Invoice,
    items: insertedItems as InvoiceItem[]
  };
};

export const getInvoiceWithItems = async (
  invoiceId: string
): Promise<{ invoice: Invoice, items: InvoiceItem[] }> => {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();
    
  if (invoiceError) {
    console.error(`Error fetching invoice with ID ${invoiceId}:`, invoiceError);
    throw new Error(invoiceError.message);
  }
  
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
  
  const typedInvoice = {
    ...invoice,
    payment_type: invoice.payment_type as 'cash' | 'credit'
  };
  
  return {
    invoice: typedInvoice as Invoice,
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
  
  const typedData = data?.map(invoice => ({
    ...invoice,
    payment_type: invoice.payment_type as 'cash' | 'credit'
  })) || [];
  
  return typedData as Invoice[];
};
