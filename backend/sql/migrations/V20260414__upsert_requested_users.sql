-- Requested user registration batch
-- Password plaintext: 11112222
-- BCrypt hash used below: $2b$12$JilI115du5RIwGyW0Fd4iuBJO1gqR2tFMpQX6oBXz/BmblE0DYPAe

INSERT INTO users (name, email, password, role, department, profile_image, created_at, updated_at)
VALUES
    ('leader1', 'leader1@test.com', '$2b$12$JilI115du5RIwGyW0Fd4iuBJO1gqR2tFMpQX6oBXz/BmblE0DYPAe', 'MEMBER', 'Computer Science', NULL, NOW(), NOW()),
    ('leader2', 'leader2@test.com', '$2b$12$JilI115du5RIwGyW0Fd4iuBJO1gqR2tFMpQX6oBXz/BmblE0DYPAe', 'MEMBER', 'Software Engineering', NULL, NOW(), NOW()),
    ('user1',   'user1@test.com',   '$2b$12$JilI115du5RIwGyW0Fd4iuBJO1gqR2tFMpQX6oBXz/BmblE0DYPAe', 'MEMBER', 'Artificial Intelligence', NULL, NOW(), NOW()),
    ('user2',   'user2@test.com',   '$2b$12$JilI115du5RIwGyW0Fd4iuBJO1gqR2tFMpQX6oBXz/BmblE0DYPAe', 'MEMBER', 'Information Security', NULL, NOW(), NOW()),
    ('user3',   'user3@test.com',   '$2b$12$JilI115du5RIwGyW0Fd4iuBJO1gqR2tFMpQX6oBXz/BmblE0DYPAe', 'MEMBER', 'Data Science', NULL, NOW(), NOW()),
    ('user4',   'user4@test.com',   '$2b$12$JilI115du5RIwGyW0Fd4iuBJO1gqR2tFMpQX6oBXz/BmblE0DYPAe', 'MEMBER', 'Business Administration', NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password = VALUES(password),
    role = VALUES(role),
    department = VALUES(department),
    updated_at = NOW();

-- Verification
SELECT id, name, email, role, created_at, updated_at
FROM users
WHERE email IN (
    'leader1@test.com',
    'leader2@test.com',
    'user1@test.com',
    'user2@test.com',
    'user3@test.com',
    'user4@test.com'
)
ORDER BY email;
