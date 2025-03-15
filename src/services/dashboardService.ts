
import { supabase } from '@/integrations/supabase/client';

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
