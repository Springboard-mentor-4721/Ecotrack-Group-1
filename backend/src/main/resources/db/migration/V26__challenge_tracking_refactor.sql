ALTER TABLE challenges 
ADD COLUMN tracking_method VARCHAR(20) NOT NULL DEFAULT 'HYBRID';

ALTER TABLE challenges 
ADD COLUMN rules_config JSON;
