CREATE TABLE `users` (
  `id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Surrogate PK',
  `name` varchar(100) NOT NULL COMMENT 'Display name, 2–100 chars',
  `email` varchar(255) UNIQUE NOT NULL COMMENT 'Login email',
  `password_hash` varchar(255) COMMENT 'BCrypt hash; NULL for OAuth-only',
  `role` varchar(10) NOT NULL DEFAULT 'USER' COMMENT 'USER | ADMIN',
  `status` varchar(10) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE | SUSPENDED',
  `oauth_provider` varchar(50) COMMENT 'e.g. GOOGLE; NULL for password accounts',
  `oauth_id` varchar(255) COMMENT 'Provider user ID; unique when non-null',
  `email_verified` boolean NOT NULL DEFAULT false,
  `last_login_at` timestamp,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `user_profiles` (
  `id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNIQUE NOT NULL COMMENT '1:1 with users; CASCADE delete',
  `bio` text COMMENT 'Max 500 chars',
  `profile_picture_url` varchar(500),
  `location` varchar(150) COMMENT 'Free-text city/country',
  `lifestyle_preferences` text COMMENT 'JSON array of lifestyle tags',
  `fcm_token` varchar(500) COMMENT 'Firebase Cloud Messaging push token',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `user_interests` (
  `id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT 'CASCADE delete',
  `interest_category` varchar(100) NOT NULL COMMENT 'Fixed value list (e.g. CYCLING, VEGANISM)',
  `created_at` timestamp NOT NULL DEFAULT (now())
);

CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`);
CREATE INDEX `idx_users_oauth` ON `users` (`oauth_provider`, `oauth_id`);
CREATE UNIQUE INDEX `uq_user_interests` ON `user_interests` (`user_id`, `interest_category`);

ALTER TABLE `user_profiles` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `user_interests` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
