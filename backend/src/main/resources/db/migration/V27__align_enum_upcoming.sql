-- Migration V27: Align database with UPCOMING enum addition in code
-- Since status is mapped as VARCHAR(30) rather than ENUM, no structural DDL changes are required.
-- This migration acts as a version marker indicating that the Java backend now natively supports the UPCOMING status,
-- preventing deserialization errors when fetching seeded data.

UPDATE challenges SET status = 'UPCOMING' WHERE status = 'UPCOMING';
