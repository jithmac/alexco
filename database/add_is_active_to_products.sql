ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
CREATE INDEX idx_is_active ON products(is_active);
