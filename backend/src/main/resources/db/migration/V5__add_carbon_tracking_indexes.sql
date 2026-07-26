CREATE UNIQUE INDEX `uq_ef_lookup` ON `emission_factors` (`category_id`, `unit`, `effective_from`);
CREATE INDEX `idx_ef_lookup` ON `emission_factors` (`category_id`, `unit`);

CREATE INDEX `idx_carbon_user_date` ON `carbon_entries` (`user_id`, `entry_date`);
CREATE INDEX `idx_carbon_category` ON `carbon_entries` (`user_id`, `category_id`);
