-- Add new columns to carbon_categories
ALTER TABLE carbon_categories
ADD COLUMN display_order INT NOT NULL DEFAULT 0,
ADD COLUMN color VARCHAR(7),
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Update existing categories with metadata
UPDATE carbon_categories SET display_order = 1, icon = 'directions_car', color = '#2196F3' WHERE name = 'Transportation';
UPDATE carbon_categories SET display_order = 2, icon = 'bolt', color = '#FFC107' WHERE name = 'Energy';
UPDATE carbon_categories SET display_order = 3, icon = 'local_gas_station', color = '#FF9800' WHERE name = 'Fuel';
UPDATE carbon_categories SET display_order = 4, icon = 'restaurant', color = '#4CAF50' WHERE name = 'Food';
UPDATE carbon_categories SET display_order = 5, icon = 'delete', color = '#9E9E9E' WHERE name = 'Waste';
UPDATE carbon_categories SET display_order = 6, icon = 'water_drop', color = '#03A9F4' WHERE name = 'Water Usage';
UPDATE carbon_categories SET display_order = 7, icon = 'shopping_bag', color = '#E91E63' WHERE name = 'Shopping';
UPDATE carbon_categories SET display_order = 8, icon = 'flight', color = '#673AB7' WHERE name = 'Travel';
