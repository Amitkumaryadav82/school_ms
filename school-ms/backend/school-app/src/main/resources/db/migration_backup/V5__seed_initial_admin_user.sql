-- Seed an initial admin user with a strong default password hash.
-- Password plaintext suggestion: ChangeMe_Initial1! (ask user to change immediately).
-- BCrypt hash generated with cost 10.
INSERT INTO users (id,username,password,email,full_name,enabled,account_non_expired,account_non_locked,credentials_non_expired)
VALUES (1,'admin','$2a$10$Dow1b0CQpZK0s8AjtKq6uO2dQ.wc2u/.1ytY1/6YrXOvNhbbX6n1K','admin@schoolms.com','System Administrator',TRUE,TRUE,TRUE,TRUE)
ON CONFLICT (id) DO NOTHING;

-- Map admin user to ADMIN role
INSERT INTO user_roles (user_id, role_id)
SELECT 1, r.id FROM roles r WHERE r.name='ADMIN'
ON CONFLICT DO NOTHING;