-- ============================================================
-- V42: Add Challenge Badge Support
-- ============================================================

-- Step 1: Extend Badges Table
ALTER TABLE badges ADD COLUMN type VARCHAR(20) DEFAULT 'GENERIC' NOT NULL;
ALTER TABLE badges ADD COLUMN icon VARCHAR(50);
ALTER TABLE badges ADD COLUMN color VARCHAR(20);

ALTER TABLE badges MODIFY criteria_type VARCHAR(50) NULL;
ALTER TABLE badges MODIFY criteria_threshold INT NULL;

-- Step 2: Extend Challenges Table
ALTER TABLE challenges ADD COLUMN badge_id BIGINT;
ALTER TABLE challenges ADD CONSTRAINT fk_challenges_badge FOREIGN KEY (badge_id) REFERENCES badges (id) ON DELETE SET NULL;

-- Step 3: Seed Challenge Badges
INSERT INTO badges (id, name, description, category, rarity, is_hidden, is_repeatable, type, icon, color) VALUES
(101, 'Transit Pioneer', 'Master sustainable commuting.', 'Transportation', 'RARE', false, false, 'CHALLENGE', 'Bus', 'blue'),
(102, 'Plant Powered', 'Completed Vegan for Earth.', 'Food', 'COMMON', false, false, 'CHALLENGE', 'Leaf', 'green'),
(103, 'Plastic-Free Hero', 'Completed No Plastic July.', 'Waste', 'EPIC', false, false, 'CHALLENGE', 'Trash2', 'violet'),
(104, 'Cycling Champion', 'Completed Cycle to Work Challenge.', 'Transportation', 'RARE', false, false, 'CHALLENGE', 'Bike', 'emerald'),
(105, 'Tree Guardian', 'Planted trees together.', 'Community', 'EPIC', false, false, 'CHALLENGE', 'TreePine', 'green'),
(106, 'Watt Saver', 'Reduced electricity consumption.', 'Energy', 'RARE', false, false, 'CHALLENGE', 'Zap', 'amber'),
(107, 'Waste Warrior', 'Produced absolutely zero waste.', 'Waste', 'EPIC', false, false, 'CHALLENGE', 'Recycle', 'violet'),
(108, 'Water Guardian', 'Conserved water.', 'Water', 'EPIC', false, false, 'CHALLENGE', 'Droplets', 'blue'),
(109, 'Earth Plate', 'Committed to Meatless Mondays.', 'Food', 'COMMON', false, false, 'CHALLENGE', 'Utensils', 'green'),
(110, 'Conscious Shopper', 'Shopped sustainably.', 'Community', 'RARE', false, false, 'CHALLENGE', 'ShoppingBag', 'teal'),
(111, 'Second-Life Hero', 'Donated instead of throwing away.', 'Community', 'RARE', false, false, 'CHALLENGE', 'HeartHandshake', 'orange'),
(112, 'Solar Champion', 'Transitioned to renewable energy.', 'Energy', 'EPIC', false, false, 'CHALLENGE', 'Sun', 'amber');

-- Step 4: Map Badges to Seeded Challenges
UPDATE challenges SET badge_id = 101 WHERE id = 2001;
UPDATE challenges SET badge_id = 102 WHERE id = 2002;
UPDATE challenges SET badge_id = 103 WHERE id = 2003;
UPDATE challenges SET badge_id = 104 WHERE id = 2004;
UPDATE challenges SET badge_id = 105 WHERE id = 2005;
UPDATE challenges SET badge_id = 106 WHERE id = 2006;
UPDATE challenges SET badge_id = 107 WHERE id = 2007;
UPDATE challenges SET badge_id = 108 WHERE id = 2008;
UPDATE challenges SET badge_id = 109 WHERE id = 2009;
UPDATE challenges SET badge_id = 110 WHERE id = 2010;
UPDATE challenges SET badge_id = 111 WHERE id = 2011;
UPDATE challenges SET badge_id = 112 WHERE id = 2012;
