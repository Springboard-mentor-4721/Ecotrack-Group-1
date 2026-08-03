ALTER TABLE challenges ALTER COLUMN tracking_method SET DEFAULT 'MANUAL';
UPDATE challenges SET tracking_method = 'MANUAL' WHERE tracking_method = 'HYBRID';
