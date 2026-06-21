INSERT INTO suppliers (id, name, contact_person, phone, email) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Organic Farms Ltd', 'Ali Hassan', '+92-300-1111111', 'ali@organicfarms.pk'),
  ('11111111-1111-1111-1111-111111111102', 'Green Valley Suppliers', 'Sara Ahmed', '+92-321-2222222', 'sara@greenvalley.pk')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, supplier_id, name, category, description, cost_price, selling_price, stock_quantity, image_url, is_listed) VALUES
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Organic Tomato Sauce', 'Sauces', 'Premium organic tomato sauce.', 1800, 2500, 50, 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400', true),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'Organic Pesto Sauce', 'Sauces', 'Fresh basil pesto.', 2600, 3600, 30, 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400', true),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102', 'Organic Honey', 'Sweeteners', 'Pure organic honey.', 3200, 4400, 40, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', true),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111102', 'Organic Olive Oil', 'Oils', 'Extra virgin olive oil.', 4600, 6400, 25, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', true),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111101', 'Organic Coconut Oil', 'Oils', 'Premium coconut oil.', 3800, 5300, 35, 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=400', true),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111102', 'Organic Maple Syrup', 'Sweeteners', 'Pure maple syrup.', 4000, 5500, 20, 'https://images.unsplash.com/photo-1517093725432-a9acbcaa41df?w=400', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_orders (id, supplier_id, product_id, quantity, unit_cost, status, received_at) VALUES
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 50, 1800, 'received', NOW() - INTERVAL '7 days'),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222203', 40, 3200, 'received', NOW() - INTERVAL '5 days'),
  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222202', 20, 2600, 'ordered', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, customer_name, phone_number, address, total_amount, order_status, payment_status, payment_method, order_date) VALUES
  ('44444444-4444-4444-4444-444444444401', 'Ahmed Khan', '+92-300-1234567', '123 Main Street, Karachi', 6900, 'confirmed', 'paid', 'card_mock', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  ('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222201', 1, 2500),
  ('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222203', 1, 4400);
