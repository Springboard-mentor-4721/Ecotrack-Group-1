ALTER TABLE user_gamification_profiles
ADD COLUMN longest_streak INT NOT NULL DEFAULT 0;

-- Set longest streak to current streak initially to avoid losing existing streaks
UPDATE user_gamification_profiles
SET longest_streak = current_streak
WHERE current_streak > 0;
