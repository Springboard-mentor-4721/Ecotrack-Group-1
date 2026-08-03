ALTER TABLE `carbon_categories` ADD COLUMN `code` varchar(50);
UPDATE `carbon_categories` SET `code` = UPPER(REPLACE(`name`, ' ', '_'));
UPDATE `carbon_categories` SET `code` = 'WATER' WHERE `name` = 'Water Usage';
UPDATE `carbon_categories` SET `code` = 'SHOPPING' WHERE `name` = 'Online Shopping';
ALTER TABLE `carbon_categories` ADD UNIQUE INDEX `idx_carbon_category_code` (`code`);
