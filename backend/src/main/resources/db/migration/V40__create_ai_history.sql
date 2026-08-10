CREATE TABLE ai_generation_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_json TEXT NOT NULL,
    model_used VARCHAR(50),
    generation_source VARCHAR(50),
    reference_key VARCHAR(100),
    period_start DATE,
    period_end DATE,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_history_user_type ON ai_generation_history(user_id, content_type);
CREATE INDEX idx_ai_history_user_generated ON ai_generation_history(user_id, generated_at DESC);
