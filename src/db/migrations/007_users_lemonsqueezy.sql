ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemonsqueezy_customer_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemonsqueezy_subscription_id TEXT UNIQUE;
