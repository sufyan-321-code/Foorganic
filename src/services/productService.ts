import { supabase } from '../lib/supabase';
import { Product, StoreProduct, toStoreProduct } from '../types';

export async function getListedProducts(): Promise<StoreProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_listed', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(toStoreProduct);
}

export async function getProductById(id: string): Promise<StoreProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_listed', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return toStoreProduct(data);
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, supplier:suppliers(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createProduct(
  product: Omit<Product, 'id' | 'created_at' | 'supplier'>
): Promise<Product> {
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleListed(id: string, isListed: boolean): Promise<void> {
  const { error } = await supabase.from('products').update({ is_listed: isListed }).eq('id', id);
  if (error) throw error;
}

export async function getProductCount(): Promise<number> {
  const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

export async function getListedCount(): Promise<number> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_listed', true);
  if (error) throw error;
  return count || 0;
}
