CREATE TABLE user_gamification_profiles (
    user_id BIGINT PRIMARY KEY,
    current_eco_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    lifetime_eco_xp BIGINT NOT NULL DEFAULT 0,
    current_level INT NOT NULL DEFAULT 1,
    current_streak INT NOT NULL DEFAULT 0,
    last_activity_date DATE NULL,
    last_score_update_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monthly_score_snapshot DECIMAL(5,2) DEFAULT 0,
    monthly_snapshot_month INT,
    CONSTRAINT fk_gamification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_eco_score CHECK (current_eco_score >= 0 AND current_eco_score <= 100)
);
