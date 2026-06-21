-- FOORGANICS E-Commerce MVP Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_listed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(10,2) NOT NULL CHECK (unit_cost >= 0),
  status TEXT NOT NULL DEFAULT 'ordered' CHECK (status IN ('ordered', 'received')),
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  received_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  payment_method TEXT CHECK (payment_method IN ('cod', 'card_mock')),
  order_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL
);

CREATE OR REPLACE FUNCTION receive_purchase_order(po_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE po RECORD;
BEGIN
  SELECT * INTO po FROM purchase_orders WHERE id = po_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Purchase order not found'; END IF;
  IF po.status = 'received' THEN RAISE EXCEPTION 'Purchase order already received'; END IF;
  UPDATE purchase_orders SET status = 'received', received_at = NOW() WHERE id = po_id;
  UPDATE products SET stock_quantity = stock_quantity + po.quantity, cost_price = po.unit_cost WHERE id = po.product_id;
END; $$;

CREATE OR REPLACE FUNCTION place_customer_order(
  p_customer_name TEXT, p_phone_number TEXT, p_address TEXT, p_payment_method TEXT, p_items JSONB
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order_id UUID; v_total NUMERIC(10,2) := 0; v_item JSONB; v_product_id UUID; v_quantity INTEGER;
  v_product RECORD; v_unit_price NUMERIC(10,2);
BEGIN
  IF jsonb_array_length(p_items) = 0 THEN RAISE EXCEPTION 'Order must contain at least one item'; END IF;
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    SELECT * INTO v_product FROM products WHERE id = v_product_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Product not found'; END IF;
    IF NOT v_product.is_listed THEN RAISE EXCEPTION 'Product is not listed: %', v_product.name; END IF;
    IF v_product.stock_quantity < v_quantity THEN RAISE EXCEPTION 'Insufficient stock for: %', v_product.name; END IF;
    v_total := v_total + (v_product.selling_price * v_quantity);
  END LOOP;
  INSERT INTO orders (customer_name, phone_number, address, total_amount, payment_status, payment_method)
  VALUES (p_customer_name, p_phone_number, p_address, v_total,
    CASE WHEN p_payment_method = 'cod' THEN 'unpaid' ELSE 'paid' END, p_payment_method)
  RETURNING id INTO v_order_id;
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    SELECT selling_price INTO v_unit_price FROM products WHERE id = v_product_id;
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (v_order_id, v_product_id, v_quantity, v_unit_price);
    UPDATE products SET stock_quantity = stock_quantity - v_quantity WHERE id = v_product_id;
  END LOOP;
  RETURN v_order_id;
END; $$;

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view listed products" ON products;
CREATE POLICY "Public can view listed products" ON products FOR SELECT USING (is_listed = true);
DROP POLICY IF EXISTS "Admin full access to products" ON products;
CREATE POLICY "Admin full access to products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full access to suppliers" ON suppliers;
CREATE POLICY "Admin full access to suppliers" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full access to purchase_orders" ON purchase_orders;
CREATE POLICY "Admin full access to purchase_orders" ON purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can create orders" ON orders;
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin can view orders" ON orders;
CREATE POLICY "Admin can view orders" ON orders FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Public can create order items" ON order_items;
CREATE POLICY "Public can create order items" ON order_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin can view order items" ON order_items;
CREATE POLICY "Admin can view order items" ON order_items FOR SELECT TO authenticated USING (true);

GRANT EXECUTE ON FUNCTION receive_purchase_order(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION place_customer_order(TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;
