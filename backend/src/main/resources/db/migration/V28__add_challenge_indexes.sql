-- Add composite index for admin challenge filtering
-- Used by JpaSpecificationExecutor when filtering by status and tracking_method
CREATE INDEX idx_challenges_status_tracking ON challenges(status, tracking_method);
