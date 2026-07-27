CREATE TABLE badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    rarity VARCHAR(20) NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    is_repeatable BOOLEAN NOT NULL DEFAULT FALSE,
    criteria_type VARCHAR(50) NOT NULL,
    criteria_threshold INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_badges_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

CREATE TABLE badge_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    current_value INT NOT NULL DEFAULT 0,
    last_evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_badge_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_badge_progress_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE RESTRICT,
    CONSTRAINT uq_badge_progress UNIQUE (user_id, badge_id)
);

CREATE INDEX idx_badge_progress_user ON badge_progress(user_id);
