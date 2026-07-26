CREATE TABLE `carbon_categories` (
  `category_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Surrogate PK',
  `name` varchar(100) UNIQUE NOT NULL COMMENT 'Canonical name e.g. TRANSPORTATION',
  `description` text,
  `icon` varchar(500) COMMENT 'URL to category icon image',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now())
);

CREATE UNIQUE INDEX `idx_cc_name` ON `carbon_categories` (`name`);
