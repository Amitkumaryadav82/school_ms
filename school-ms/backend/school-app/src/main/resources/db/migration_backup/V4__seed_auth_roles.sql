-- Seed roles
INSERT INTO roles (id,name,description) VALUES
  (1,'ADMIN','Administrator role'),
  (2,'TEACHER','Teacher role'),
  (3,'STUDENT','Student role'),
  (4,'PARENT','Parent role')
ON CONFLICT (id) DO NOTHING;