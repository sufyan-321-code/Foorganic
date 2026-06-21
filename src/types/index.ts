export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string | null;
  created_at?: string;
}

export interface Product {
  id: string;
  supplier_id?: string | null;
  name: string;
  category: string;
  description: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  image_url: string;
  is_listed: boolean;
  created_at?: string;
  supplier?: Supplier;
}

/** Store-facing product shape with price alias */
export interface StoreProduct extends Product {
  price: number;
  image: string;
}

export interface CartItem extends StoreProduct {
  quantity: number;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  status: 'ordered' | 'received';
  ordered_at: string;
  received_at?: string | null;
  supplier?: Supplier;
  product?: Product;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Order {
  id: string;
  customer_name: string;
  phone_number: string;
  address: string;
  total_amount: number;
  order_status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid';
  payment_method?: 'cod' | 'card_mock' | null;
  order_date: string;
  order_items?: OrderItem[];
}

export interface CheckoutData {
  fullName: string;
  phoneNumber: string;
  address: string;
}

export interface DashboardStats {
  totalProducts: number;
  listedProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export type PaymentMethod = 'cod' | 'card_mock';

export function toStoreProduct(product: Product): StoreProduct {
  return {
    ...product,
    price: product.selling_price,
    image: product.image_url || '',
  };
}
