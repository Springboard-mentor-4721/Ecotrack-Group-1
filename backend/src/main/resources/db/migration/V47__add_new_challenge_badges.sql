-- V47__add_new_challenge_badges.sql

INSERT INTO badges (id, name, description, category, rarity, is_hidden, is_repeatable, type, icon, color) VALUES
(113, 'Carbon Crusher', 'Completed a carbon reduction challenge.', 'Overall Sustainability', 'EPIC', false, false, 'CHALLENGE', 'co2', 'blue'),
(114, 'Car-Free Champion', 'Completed a car-free challenge.', 'Transportation', 'RARE', false, false, 'CHALLENGE', 'directions_car_filled', 'green'),
(115, 'Digital Eco Hero', 'Completed a digital detox challenge.', 'Lifestyle', 'COMMON', false, false, 'CHALLENGE', 'phonelink_off', 'purple'),
(116, 'Eco Commuter', 'Completed an eco-friendly commuting challenge.', 'Transportation', 'RARE', false, false, 'CHALLENGE', 'emoji_transportation', 'green'),
(117, 'Walking Warrior', 'Completed a walking challenge.', 'Transportation', 'COMMON', false, false, 'CHALLENGE', 'directions_walk', 'green'),
(118, 'Green Lifestyle Champion', 'Completed a sustainable lifestyle challenge.', 'Generic', 'COMMON', false, false, 'CHALLENGE', 'build', 'slate'),
(119, 'Beach Guardian', 'Completed a beach cleanup challenge.', 'Community', 'EPIC', false, false, 'CHALLENGE', 'cleaning_services', 'green');
