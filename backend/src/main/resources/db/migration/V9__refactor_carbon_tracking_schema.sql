CREATE TABLE `carbon_subcategories` (
  `id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `category_id` bigint NOT NULL,
  `name` varchar(100) NOT NULL,
  `default_unit` varchar(30) NOT NULL,
  `emission_factor` decimal(10,6) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subcategory_category FOREIGN KEY (`category_id`) REFERENCES `carbon_categories` (`category_id`) ON DELETE CASCADE
);

INSERT INTO `carbon_subcategories` (`category_id`, `name`, `default_unit`, `emission_factor`) VALUES
(1, 'Car', 'km', 0.210000),
(1, 'Bike', 'km', 0.120000),
(1, 'Bus', 'km', 0.100000),
(1, 'Train', 'km', 0.040000),
(1, 'Metro', 'km', 0.030000),
(1, 'Flight', 'km', 0.250000),
(1, 'Walk', 'km', 0.000000),
(2, 'Grid Electricity', 'kWh', 0.850000),
(2, 'Solar', 'kWh', 0.000000),
(3, 'Petrol', 'litres', 2.310000),
(3, 'Diesel', 'litres', 2.680000),
(3, 'Natural Gas', 'litres', 1.900000),
(4, 'Beef', 'kg', 27.000000),
(4, 'Chicken', 'kg', 6.900000),
(4, 'Vegetarian', 'kg', 2.000000),
(4, 'Dairy', 'kg', 3.000000),
(4, 'Seafood', 'kg', 5.000000),
(5, 'Landfill', 'kg', 0.500000),
(5, 'Recycled', 'kg', 0.050000),
(6, 'Tap Water', 'litres', 0.000300),
(6, 'Bottled Water', 'litres', 0.001000),
(7, 'Electronics', 'items', 50.000000),
(7, 'Clothing', 'items', 10.000000),
(8, 'Hotel Stays', 'nights', 15.000000),
(8, 'Cruises', 'nights', 100.000000);

ALTER TABLE `carbon_entries` ADD COLUMN `sub_category_id` bigint;

UPDATE `carbon_entries` ce
JOIN `carbon_subcategories` csc ON csc.category_id = ce.category_id 
  AND csc.name = ce.sub_type
SET ce.sub_category_id = csc.id;

UPDATE `carbon_entries` ce
JOIN (
    SELECT category_id, MIN(id) as first_id
    FROM `carbon_subcategories`
    GROUP BY category_id
) sub ON ce.category_id = sub.category_id
SET ce.sub_category_id = sub.first_id
WHERE ce.sub_category_id IS NULL;

-- If there are still nulls (e.g., category had no subcategories), map to the absolute first subcategory
UPDATE `carbon_entries` SET `sub_category_id` = 1 WHERE `sub_category_id` IS NULL;

ALTER TABLE `carbon_entries` MODIFY `sub_category_id` bigint NOT NULL;
ALTER TABLE `carbon_entries` ADD CONSTRAINT `fk_ce_subcategory` FOREIGN KEY (`sub_category_id`) REFERENCES `carbon_subcategories` (`id`) ON DELETE RESTRICT;

ALTER TABLE `carbon_entries` MODIFY `category_id` bigint NULL;
ALTER TABLE `carbon_entries` MODIFY `sub_type` varchar(100) NULL;
ALTER TABLE `carbon_entries` MODIFY `unit` varchar(30) NULL;

-- Create an index for searching by notes
ALTER TABLE `carbon_entries` ADD INDEX `idx_notes` (`notes`);
