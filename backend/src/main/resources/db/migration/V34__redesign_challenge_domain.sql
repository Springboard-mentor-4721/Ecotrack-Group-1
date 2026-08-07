-- ============================================================
-- V34: Challenge Domain Redesign
-- Remove Challenge Type, replace ProgressType with ProgressMetric
-- ============================================================

-- Step 1: Drop the FK constraint
ALTER TABLE challenges DROP FOREIGN KEY fk_challenges_type;

-- Step 2: Drop type_code column
ALTER TABLE challenges DROP COLUMN type_code;

-- Step 3: Drop the challenge_type_config table
DROP TABLE challenge_type_config;

-- Step 4: Add progress_metric column with safe default
ALTER TABLE challenges ADD COLUMN progress_metric VARCHAR(30) NOT NULL DEFAULT 'ENTRY_COUNT';

-- Step 5: Migrate existing ProgressType values
UPDATE challenges SET progress_metric = 'ENTRY_COUNT' WHERE progress_type = 'COUNT';
UPDATE challenges SET progress_metric = 'CARBON_EMISSION' WHERE progress_type = 'AMOUNT';

-- Step 6: Drop old progress_type column
ALTER TABLE challenges DROP COLUMN progress_type;

-- Step 7: Rename community_progress to global_progress
ALTER TABLE challenges CHANGE COLUMN community_progress global_progress DECIMAL(19,4) NOT NULL DEFAULT 0.0;

-- Step 8: Ensure challenge_evaluation_type column exists
ALTER TABLE challenges ADD COLUMN challenge_evaluation_type VARCHAR(20) NOT NULL DEFAULT 'ACHIEVEMENT';

-- Step 9: Index for new column
CREATE INDEX idx_challenges_progress_metric ON challenges(progress_metric);
