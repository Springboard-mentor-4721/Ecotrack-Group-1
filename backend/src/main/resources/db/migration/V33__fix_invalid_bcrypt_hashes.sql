-- Fix for BUG-012: Replace invalid BCrypt hashes that cause 500 errors during authentication
-- Generated valid BCrypt hash for "demo123"
UPDATE users SET password_hash = '$2a$10$4YvvS8ZFrzBLtWbYxMx7ue1hKT9ZjmXC./EDQBwn2rY2o0i/fb.7O' WHERE password_hash = '$2a$10$xyz';
