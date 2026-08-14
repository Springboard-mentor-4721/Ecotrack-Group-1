-- ============================================================
-- V43: Make Badge Rarity Nullable for Challenge Badges
-- ============================================================

ALTER TABLE badges MODIFY rarity VARCHAR(20) NULL;

-- Remove rarity from existing challenge badges safely
UPDATE badges SET rarity = NULL WHERE type = 'CHALLENGE';
