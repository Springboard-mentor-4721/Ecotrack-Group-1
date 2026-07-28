-- V21__seed_initial_badges.sql
-- The Technical Design Specification does not explicitly define the badge catalog.
-- The Milestone 3 Roadmap suggests 5 badges, but not all of them are currently supported by the BadgeEngine.
-- This catalog is designed to be 100% compatible with the existing fully implemented BadgeEngine listeners:
-- CARBON_ENTRIES_COUNT, GOAL_COMPLETED_COUNT, STREAK_DAYS.

INSERT INTO badges (name, category, description, rarity, is_hidden, is_repeatable, criteria_type, criteria_threshold)
VALUES
('First Logger', 'TRACKING', 'Log your first carbon entry.', 'COMMON', FALSE, FALSE, 'CARBON_ENTRIES_COUNT', 1),
('Goal Getter', 'GOALS', 'Complete your first carbon reduction goal.', 'COMMON', FALSE, FALSE, 'GOAL_COMPLETED_COUNT', 1),
('Consistent Logger', 'ENGAGEMENT', 'Achieve a 7-day logging streak.', 'RARE', FALSE, FALSE, 'STREAK_DAYS', 7),
('Dedicated Tracker', 'TRACKING', 'Log 50 total carbon entries.', 'EPIC', FALSE, FALSE, 'CARBON_ENTRIES_COUNT', 50),
('Goal Master', 'GOALS', 'Complete 5 carbon reduction goals.', 'RARE', FALSE, FALSE, 'GOAL_COMPLETED_COUNT', 5);
