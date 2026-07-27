CREATE TABLE challenge_type_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_code VARCHAR(30) NOT NULL UNIQUE,
    is_public BOOLEAN NOT NULL,
    requires_approval BOOLEAN NOT NULL,
    auto_enroll BOOLEAN NOT NULL,
    reward_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0
);

INSERT INTO challenge_type_config (type_code, is_public, requires_approval, auto_enroll, reward_multiplier) VALUES
('PERSONAL', FALSE, FALSE, TRUE, 1.0),
('COMMUNITY', TRUE, TRUE, FALSE, 1.5),
('SEASONAL', TRUE, TRUE, FALSE, 2.0),
('RECURRING', TRUE, FALSE, FALSE, 1.0);
