import { supabase } from '../lib/supabase';
import { Order, DashboardStats, PaymentMethod } from '../types';

export async function createOrder(
  customerName: string,
  phoneNumber: string,
  address: string,
  paymentMethod: PaymentMethod,
  items: { product_id: string; quantity: number }[]
): Promise<string> {
  const { data, error } = await supabase.rpc('place_customer_order', {
    p_customer_name: customerName,
    p_phone_number: phoneNumber,
    p_address: address,
    p_payment_method: paymentMethod,
    p_items: items,
  });

  if (error) throw error;
  return data as string;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*))')
    .order('order_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*))')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function updateOrderStatus(
  id: string,
  orderStatus: Order['order_status']
): Promise<void> {
  const { error } = await supabase.from('orders').update({ order_status: orderStatus }).eq('id', id);
  if (error) throw error;
}

export async function markPaymentReceived(id: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: 'paid' })
    .eq('id', id);
  if (error) throw error;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [productsRes, listedRes, ordersRes, pendingRes, revenueRes] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_listed', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'pending'),
    supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
  ]);

  const totalRevenue = (revenueRes.data || []).reduce(
    (sum, o) => sum + Number(o.total_amount),
    0
  );

  return {
    totalProducts: productsRes.count || 0,
    listedProducts: listedRes.count || 0,
    totalOrders: ordersRes.count || 0,
    pendingOrders: pendingRes.count || 0,
    totalRevenue,
  };
}
