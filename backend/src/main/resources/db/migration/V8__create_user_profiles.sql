CREATE TABLE `user_profiles` (
  `id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNIQUE NOT NULL COMMENT 'FK → users; CASCADE delete',
  `bio` varchar(500),
  `profile_picture_url` varchar(500),
  `location` varchar(150),
  `lifestyle_preferences` text,
  `fcm_token` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now())
);

ALTER TABLE `user_profiles` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
