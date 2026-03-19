-- Seed Data generated for Hostinger

-- Locations
INSERT IGNORE INTO locations (id, name, type) VALUES ('14003dbd-ddf9-4f5a-a01c-78f97d8b0652', 'Main Store', 'Store');

-- Products
INSERT INTO products (id, sku, name, category_path, price_retail, tax_code, description, specifications) VALUES ('bc3b9925-d61f-476e-9ba3-e50f4e5baba5', 'SOL-PNL-450W', 'Jinko Solar Tiger Neo 450W', 'solar-panels', 45000, 'VAT_18', 'High efficiency N-type mono module.', '{}') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code) VALUES ('0aded65f-c06e-4b06-b97e-eaf01f493e83', 'bc3b9925-d61f-476e-9ba3-e50f4e5baba5', '14003dbd-ddf9-4f5a-a01c-78f97d8b0652', 50, 'INITIAL_STOCK');
INSERT INTO products (id, sku, name, category_path, price_retail, tax_code, description, specifications) VALUES ('c5d53e60-d837-4789-a93e-65f96322e172', 'SOL-PNL-550W', 'Jinko Solar Tiger Pro 550W', 'solar-panels', 52000, 'VAT_18', 'Ultra-high power for large installations.', '{}') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code) VALUES ('96832805-0e5d-4788-ab1e-0dbcbb5a5af3', 'c5d53e60-d837-4789-a93e-65f96322e172', '14003dbd-ddf9-4f5a-a01c-78f97d8b0652', 50, 'INITIAL_STOCK');
INSERT INTO products (id, sku, name, category_path, price_retail, tax_code, description, specifications) VALUES ('115347c1-0a1e-49fe-b9b0-d8a34238450e', 'INV-HUA-5K', 'Huawei SUN2000-5KTL-L1', 'inverters', 285000, 'VAT_18', 'Smart Energy Center, Single Phase.', '{}') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code) VALUES ('a74fc3c6-6c2b-46d9-994b-4308ac414185', '115347c1-0a1e-49fe-b9b0-d8a34238450e', '14003dbd-ddf9-4f5a-a01c-78f97d8b0652', 50, 'INITIAL_STOCK');
INSERT INTO products (id, sku, name, category_path, price_retail, tax_code, description, specifications) VALUES ('050edf30-2b05-4595-a533-4c87447c4e46', 'BAT-LFP-5K', 'Huawei LUNA2000-5-E0 (5kWh)', 'batteries', 650000, 'VAT_18', 'Smart String Energy Storage System.', '{}') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code) VALUES ('1c11bbdc-0149-4851-beda-d13561ca2b8a', '050edf30-2b05-4595-a533-4c87447c4e46', '14003dbd-ddf9-4f5a-a01c-78f97d8b0652', 50, 'INITIAL_STOCK');
INSERT INTO products (id, sku, name, category_path, price_retail, tax_code, description, specifications) VALUES ('1e91dcdb-8060-4ca5-9481-36a53a4b985c', 'CABLE-PV-4MM', 'PV Cable 4mm (Red)', 'solar-accessories', 350, 'VAT_18', 'UV resistant solar cable, per meter.', '{}') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code) VALUES ('ee4c23b7-4cc2-4862-9376-220190f7689c', '1e91dcdb-8060-4ca5-9481-36a53a4b985c', '14003dbd-ddf9-4f5a-a01c-78f97d8b0652', 50, 'INITIAL_STOCK');
INSERT INTO products (id, sku, name, category_path, price_retail, tax_code, description, specifications) VALUES ('ae466105-0e94-4cb4-851e-24b7795358dc', 'SMART-SW-1G', 'Tuya Smart Switch 1-Gang', 'switches-sockets', 4500, 'VAT_18', 'WiFi + Bluetooth, No Neutral required.', '{}') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code) VALUES ('c8d2c052-259c-44e7-ac96-d983453c2663', 'ae466105-0e94-4cb4-851e-24b7795358dc', '14003dbd-ddf9-4f5a-a01c-78f97d8b0652', 50, 'INITIAL_STOCK');

-- Update Admin Password
UPDATE users SET password_hash = '$2b$10$/W9URTlnPVuXWUNMTgETVelc59zPDBkuNO2WxtdgrCkEer2fw64du', is_active = 1 WHERE username = 'admin';

-- Ensure DB Access User exists as app user too
INSERT IGNORE INTO users (id, username, password_hash, full_name, role, is_active) VALUES ('afede8b9-01e1-404b-b1ff-ca7256045a0d', 'u624100610_alexco2', '$2b$10$qeOORwOYVgoPnmWTRu0h6uyhXZseJtPfKAaH5eFZ2qPdYZM788jXK', 'Database Admin', 'super_user', 1);
