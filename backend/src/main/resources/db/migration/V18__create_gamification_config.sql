CREATE TABLE gamification_config (
    config_key VARCHAR(50) PRIMARY KEY,
    config_value VARCHAR(255) NOT NULL,
    value_type VARCHAR(20) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO gamification_config (config_key, config_value, value_type, description) VALUES
('DAILY_LOGIN_XP', '10', 'INT', 'XP for first login of day'),
('CARBON_ENTRY_XP', '25', 'INT', 'XP for logging carbon entry'),
('GOAL_COMPLETION_XP', '100', 'INT', 'XP for manual goal completion'),
('AUTO_BUDGET_GOAL_XP', '250', 'INT', 'XP for auto-budget goal completion'),
('COMMUNITY_CHALLENGE_XP', '500', 'INT', 'XP for community challenge completion'),
('STREAK_7_DAY_XP', '200', 'INT', 'XP for 7 day streak'),
('ECO_SCORE_DECAY_RATE', '0.5', 'DECIMAL', 'Daily Eco Score decay amount'),
('ECO_SCORE_INACTIVE_DAYS', '7', 'INT', 'Days of inactivity before decay starts'),
('ECO_SCORE_WEIGHT_REDUCTION', '0.40', 'DECIMAL', 'Weight for reduction factor'),
('ECO_SCORE_WEIGHT_GOAL', '0.30', 'DECIMAL', 'Weight for goal completion rate'),
('ECO_SCORE_WEIGHT_CHALLENGE', '0.20', 'DECIMAL', 'Weight for challenge participation'),
('ECO_SCORE_WEIGHT_STREAK', '0.10', 'DECIMAL', 'Weight for streak factor'),
('LEVEL_1_THRESHOLD', '0', 'INT', 'XP for Beginner level'),
('LEVEL_2_THRESHOLD', '1000', 'INT', 'XP for Intermediate level'),
('LEVEL_3_THRESHOLD', '5000', 'INT', 'XP for Advanced level'),
('LEVEL_4_THRESHOLD', '15000', 'INT', 'XP for Expert level'),
('LEVEL_5_THRESHOLD', '50000', 'INT', 'XP for Champion level'),
('MAX_DAILY_LOGIN_CAP', '1', 'INT', 'Max daily login XP events allowed'),
('MAX_DAILY_CARBON_ENTRY_CAP', '3', 'INT', 'Max daily carbon entry XP events allowed');
