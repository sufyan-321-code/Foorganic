import { supabase } from '../lib/supabase';
import { PurchaseOrder } from '../types';

export async function getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, supplier:suppliers(*), product:products(*)')
    .order('ordered_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createPurchaseOrder(
  order: Omit<PurchaseOrder, 'id' | 'status' | 'ordered_at' | 'received_at' | 'supplier' | 'product'>
): Promise<PurchaseOrder> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .insert({ ...order, status: 'ordered' })
    .select('*, supplier:suppliers(*), product:products(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function markPurchaseReceived(id: string): Promise<void> {
  const { error } = await supabase.rpc('receive_purchase_order', { po_id: id });
  if (error) throw error;
}
