-- Insert default staff roles
INSERT INTO public.staff_roles (role_name, description, created_at, updated_at)
VALUES ('Principal', 'School head responsible for overall management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO public.staff_roles (role_name, description, created_at, updated_at)
VALUES ('Admin Officer', 'Handles administrative tasks', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    
INSERT INTO public.staff_roles (role_name, description, created_at, updated_at)
VALUES ('Management', 'Responsible for school operations and management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    
-- Remaining inserts from original file will be preserved
