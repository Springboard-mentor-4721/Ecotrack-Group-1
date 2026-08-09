-- Convert existing NULL source_ids (like old DAILY_LOGIN and STREAK_BONUS) to the integer representation of awarded_at date
UPDATE xp_ledger 
SET source_id = CAST(DATE_FORMAT(awarded_at, '%Y%m%d') AS UNSIGNED)
WHERE source_id IS NULL;

-- Remove duplicates keeping the earliest awarded_at (just in case duplicates were inserted by race conditions)
DELETE x1 FROM xp_ledger x1
INNER JOIN xp_ledger x2 
WHERE x1.user_id = x2.user_id 
  AND x1.source_type = x2.source_type 
  AND x1.source_id = x2.source_id 
  AND x1.id > x2.id;

-- Now source_id can safely be made NOT NULL for strict data integrity
ALTER TABLE xp_ledger MODIFY source_id BIGINT NOT NULL;

-- Add the unique constraint enforcing absolute database-level idempotency
ALTER TABLE xp_ledger ADD CONSTRAINT uk_xp_ledger_idempotency UNIQUE (user_id, source_type, source_id);
