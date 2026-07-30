-- Seed Demo Data for EcoTrack Dashboard UI Testing
-- Note: Requires Flyway to run on startup

-- 1. Create 15 Demo Users
INSERT INTO users (id, name, email, password_hash, status, role, created_at, updated_at) VALUES 
(1001, 'Alex Chen', 'alex@example.com', 'dummyhash', 'ACTIVE', 'USER', NOW(), NOW()),
(1002, 'Sarah Johnson', 'sarah@example.com', 'dummyhash', 'ACTIVE', 'USER', NOW(), NOW()),
(1003, 'Priya Kumar', 'priya@example.com', 'dummyhash', 'ACTIVE', 'USER', NOW(), NOW()),
(1004, 'David Wilson', 'david@example.com', 'dummyhash', 'ACTIVE', 'USER', NOW(), NOW()),
(1005, 'Maria Garcia', 'maria@example.com', 'dummyhash', 'ACTIVE', 'USER', NOW(), NOW()),
(1006, 'Ethan Lee', 'ethan@example.com', 'dummyhash', 'ACTIVE', 'USER', NOW(), NOW()),
(1007, 'Chloe Taylor', 'chloe@example.com', 'dummyhash', 'ACTIVE', 'USER', NOW(), NOW()),
(1008, 'James Martin', 'james@example.com', 'dummyhash', 'ACTIVE', 'USER', NOW(), NOW()),
(1009, 'Linda Fernandez', 'linda@example.com', 'dummyhash', 'ACTIVE', 'USER', NOW(), NOW()),
(1010, 'Robert Brown', 'robert@example.com', 'dummyhash', 'ACTIVE', 'USER', NOW(), NOW());

-- 2. Create User Profiles & Gamification Profiles
INSERT INTO user_profiles (user_id) VALUES 
(1001),
(1002),
(1003),
(1004),
(1005),
(1006),
(1007),
(1008),
(1009),
(1010);

INSERT INTO user_gamification_profiles (user_id, lifetime_eco_xp, current_level, current_streak, last_activity_date) VALUES 
(1001, 2540, 7, 12, CURDATE()),
(1002, 1200, 4, 3, CURDATE()),
(1003, 3400, 9, 21, CURDATE()),
(1004, 500, 2, 1, CURDATE()),
(1005, 4200, 11, 45, CURDATE()),
(1006, 800, 3, 2, CURDATE()),
(1007, 1950, 5, 8, CURDATE()),
(1008, 150, 1, 1, CURDATE()),
(1009, 3100, 8, 14, CURDATE()),
(1010, 5200, 14, 60, CURDATE());

-- 3. Create Challenges
INSERT INTO challenges (id, title, description, type_code, status, target_value, start_date, end_date, reward_xp, progress_type) VALUES
(2001, 'Public Transport Week', 'Use public transport instead of personal vehicles for a week.', 'COMMUNITY', 'ACTIVE', 25, NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 500, 'COUNT'),
(2002, 'Vegan for Earth', 'Adopt a plant-based diet to reduce carbon footprint.', 'COMMUNITY', 'ACTIVE', 20, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 400, 'COUNT'),
(2003, 'No Plastic July', 'Eliminate single-use plastics from your lifestyle.', 'COMMUNITY', 'ACTIVE', 31, NOW(), DATE_ADD(NOW(), INTERVAL 12 DAY), 600, 'COUNT'),
(2004, 'Cycle to Work Challenge', 'Commute via bicycle to save emissions.', 'COMMUNITY', 'ACTIVE', 10, NOW(), DATE_ADD(NOW(), INTERVAL 12 DAY), 500, 'COUNT'),
(2005, 'Plant a Tree Together', 'Plant trees in your local community.', 'COMMUNITY', 'ACTIVE', 5, NOW(), DATE_ADD(NOW(), INTERVAL 8 DAY), 300, 'COUNT'),
(2006, 'Energy Saver Challenge', 'Reduce electricity consumption by 20%.', 'COMMUNITY', 'ACTIVE', 100, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 700, 'AMOUNT'),
(2007, 'Zero Waste Lifestyle', 'Produce absolutely zero waste for a week.', 'COMMUNITY', 'ACTIVE', 7, NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 600, 'COUNT'),
(2008, 'Water Conservation Month', 'Reduce daily water usage below 100 liters.', 'COMMUNITY', 'ACTIVE', 30, NOW(), DATE_ADD(NOW(), INTERVAL 20 DAY), 1000, 'COUNT'),
(2009, 'Meatless Mondays', 'Commit to eating vegetarian every Monday.', 'COMMUNITY', 'ACTIVE', 4, NOW(), DATE_ADD(NOW(), INTERVAL 28 DAY), 200, 'COUNT'),
(2010, 'Sustainable Shopping', 'Only buy second-hand or eco-friendly products.', 'COMMUNITY', 'UPCOMING', 15, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 450, 'COUNT'),
(2011, 'Spring Cleaning Donations', 'Donate 10 items instead of throwing them away.', 'COMMUNITY', 'COMPLETED', 10, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 350, 'AMOUNT'),
(2012, 'Solar Power Switch', 'Transition to renewable energy sources for home.', 'COMMUNITY', 'ACTIVE', 1, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 2000, 'COUNT');

-- 4. Create Challenge Participants (Joined Challenges) for User 1001 (Alex)
INSERT INTO challenge_participants (id, challenge_id, user_id, progress, status, joined_at, completed_at) VALUES
(3001, 2001, 1001, 18, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 2 DAY), NULL),
(3002, 2002, 1001, 9, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 3 DAY), NULL),
(3003, 2003, 1001, 6, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 5 DAY), NULL),
(3004, 2011, 1001, 10, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

-- 5. Seed Fake Community Progress values for visual testing
UPDATE challenges SET community_progress = 15620 WHERE id = 2001;
UPDATE challenges SET community_progress = 430 WHERE id = 2002;
UPDATE challenges SET community_progress = 1200 WHERE id = 2003;
UPDATE challenges SET community_progress = 856 WHERE id = 2005;

-- 6. Add some Notifications
INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at) VALUES
(4001, 1001, 'SYSTEM', 'Welcome to Challenges!', 'Explore new community campaigns to earn XP.', false, NOW()),
(4002, 1001, 'CHALLENGE_REMINDER', 'Expiring Soon', 'Public Transport Week ends in 5 days. Keep going!', false, NOW()),
(4003, 1001, 'REWARD', 'XP Earned', 'You earned +350 XP for completing Spring Cleaning Donations.', true, DATE_SUB(NOW(), INTERVAL 6 DAY));
