CREATE TABLE `emission_factors` (
  `factor_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Surrogate PK',
  `category_id` bigint NOT NULL COMMENT 'FK → carbon_categories; RESTRICT delete',
  `unit` varchar(30) NOT NULL COMMENT 'Unit of measurement (km | kWh | kg …)',
  `factor_value` decimal(10,6) NOT NULL COMMENT 'CO₂e kg per unit of activity; CHECK > 0',
  `effective_from` date NOT NULL COMMENT 'Factor validity start date',
  `effective_to` date COMMENT 'Factor validity end date; NULL = currently active',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `chk_factor_value` CHECK (`factor_value` > 0)
);

ALTER TABLE `emission_factors` ADD FOREIGN KEY (`category_id`) REFERENCES `carbon_categories` (`category_id`) ON DELETE RESTRICT;
