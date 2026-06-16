-- Add payment_reference to orders for automatic payment validation (Binance Pay)
-- Stores the external transaction id (e.g. Binance transactionId) that confirmed the order.
-- The partial unique index guarantees a single transaction can only ever complete ONE order
-- (idempotency / anti-reuse) while still allowing many orders without a reference (NULL).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_reference
  ON orders(payment_reference)
  WHERE payment_reference IS NOT NULL;
