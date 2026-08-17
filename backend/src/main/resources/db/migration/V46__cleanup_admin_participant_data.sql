-- V46__cleanup_admin_participant_data.sql

-- 1. Clean up Gamification / XP Data
DELETE FROM xp_ledger WHERE user_id IN (SELECT id FROM users WHERE role = 'ADMIN');

-- Zero out Gamification Profiles for Admins instead of deleting them to prevent potential null pointers
UPDATE user_gamification_profiles 
SET lifetime_eco_xp = 0, 
    current_eco_score = 0.00, 
    current_level = 1, 
    current_streak = 0, 
    longest_streak = 0,
    monthly_score_snapshot = 0.00,
    accumulated_decay = 0.00
WHERE user_id IN (SELECT id FROM users WHERE role = 'ADMIN');

-- 2. Clean up Carbon Entries
DELETE FROM carbon_entries WHERE user_id IN (SELECT id FROM users WHERE role = 'ADMIN');

-- 3. Clean up Challenge Data
DELETE FROM challenge_participants WHERE user_id IN (SELECT id FROM users WHERE role = 'ADMIN');

-- 4. Clean up Goals Data
DELETE FROM goal_progress WHERE goal_id IN (
    SELECT id FROM goals WHERE user_id IN (SELECT id FROM users WHERE role = 'ADMIN')
);
DELETE FROM goals WHERE user_id IN (SELECT id FROM users WHERE role = 'ADMIN');

-- 5. Clean up Badges Data
DELETE FROM user_badges WHERE user_id IN (SELECT id FROM users WHERE role = 'ADMIN');
