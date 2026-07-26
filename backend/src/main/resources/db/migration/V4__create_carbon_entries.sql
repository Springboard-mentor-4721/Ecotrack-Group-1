CREATE TABLE `carbon_entries` (
  `id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT 'CASCADE delete',
  `category_id` bigint NOT NULL COMMENT 'FK → carbon_categories; RESTRICT delete',
  `sub_type` varchar(100) NOT NULL COMMENT 'Specific activity within category',
  `quantity` decimal(10,4) NOT NULL COMMENT 'CHECK > 0',
  `unit` varchar(30) NOT NULL COMMENT 'km | kWh | kg | litres …',
  `emission_kgco2e` decimal(10,4) NOT NULL COMMENT 'Calculated CO₂e stored for historical accuracy; CHECK >= 0',
  `entry_date` date NOT NULL COMMENT 'No future dates',
  `notes` varchar(500),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `chk_quantity` CHECK (`quantity` > 0),
  CONSTRAINT `chk_emission` CHECK (`emission_kgco2e` >= 0)
);

ALTER TABLE `carbon_entries` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `carbon_entries` ADD FOREIGN KEY (`category_id`) REFERENCES `carbon_categories` (`category_id`) ON DELETE RESTRICT;
