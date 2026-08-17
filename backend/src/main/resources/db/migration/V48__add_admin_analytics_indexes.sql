CREATE INDEX idx_users_created_at ON users (created_at);
CREATE INDEX idx_xp_ledger_awarded_at ON xp_ledger (awarded_at);
CREATE INDEX idx_user_badges_awarded_at ON user_badges (awarded_at);
CREATE INDEX idx_carbon_entries_entry_date ON carbon_entries (entry_date);
