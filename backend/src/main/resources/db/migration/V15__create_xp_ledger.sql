CREATE TABLE xp_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    xp_awarded INT NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id BIGINT NULL,
    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_xp_ledger_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_xp_awarded CHECK (xp_awarded > 0)
);

CREATE INDEX idx_xp_user ON xp_ledger(user_id);
CREATE INDEX idx_xp_user_date ON xp_ledger(user_id, awarded_at);
