-- Enable Row Level Security on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

-- Policy 1: Anyone (anon/authenticated) can insert orders
-- This allows customers to create orders during checkout without authentication
CREATE POLICY "Anyone can insert orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 2: Only admins can view all orders
-- This prevents unauthorized access to customer data
CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy 3: Only admins can update order status
-- Prevents customers from modifying order status
CREATE POLICY "Admins can update order status"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Optional: Allow customers to view their own orders by email
-- Useful for order tracking without authentication
CREATE POLICY "Customers can view own orders by email"
  ON orders
  FOR SELECT
  TO anon, authenticated
  USING (
    client_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Create index on client_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_client_email ON orders(client_email);

-- Create index on status for admin queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
