-- 029_quick_links_refactoring.sql

-- 1. Safely refactor the existing table
ALTER TABLE quick_links DROP COLUMN IF EXISTS category;
ALTER TABLE quick_links ADD COLUMN IF NOT EXISTS section TEXT NOT NULL DEFAULT 'General';
ALTER TABLE quick_links ADD COLUMN IF NOT EXISTS sub_section TEXT;

ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "links_select" ON quick_links;
CREATE POLICY "links_select" ON quick_links
      FOR SELECT
      USING (is_active = true);

-- Define RLS policies for Admins to easily add/edit links
DROP POLICY IF EXISTS "links_insert" ON quick_links;
CREATE POLICY "links_insert" ON quick_links FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

DROP POLICY IF EXISTS "links_update_own" ON quick_links;
DROP POLICY IF EXISTS "links_update" ON quick_links;
CREATE POLICY "links_update" ON quick_links FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

DROP POLICY IF EXISTS "links_delete_own" ON quick_links;
DROP POLICY IF EXISTS "links_delete" ON quick_links;
CREATE POLICY "links_delete" ON quick_links FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true)
);

-- Enable RLS just in case it was off
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;

-- 2. Clear out any data that might be conflicting
DELETE FROM quick_links;

-- 3. Seed explicitly from User's instructions
INSERT INTO quick_links (section, sub_section, title, url, display_order) VALUES
('Official College Website', NULL, 'Main Website', 'https://www.iitrpr.ac.in/', 10),
('Official College Website', NULL, 'IIT Ropar insta', 'https://www.instagram.com/iit_ropar_official/', 20),
('Official College Website', NULL, 'Facebook', 'https://www.facebook.com/iitrpr/?ref=embed_page#', 30),
('Official College Website', NULL, 'Linked in', 'https://in.linkedin.com/school/iitropar/', 40);

INSERT INTO quick_links (section, sub_section, title, url, display_order) VALUES
('DEPARTMENTS & CENTRES', 'Engineering', 'Artificial Intelligence and Data Engineering (AI&DE)', 'https://www.iitrpr.ac.in/saide/', 10),
('DEPARTMENTS & CENTRES', 'Engineering', 'BioMedical Engineering (BME)', 'https://www.iitrpr.ac.in/cbme/', 20),
('DEPARTMENTS & CENTRES', 'Engineering', 'Chemical Engineering', 'https://www.iitrpr.ac.in/chemical/Index/index.php', 30),
('DEPARTMENTS & CENTRES', 'Engineering', 'Civil Engineering', 'https://www.iitrpr.ac.in/civil/', 40),
('DEPARTMENTS & CENTRES', 'Engineering', 'Computer Science and Engineering (CSE)', 'https://cse.iitrpr.ac.in/', 50),
('DEPARTMENTS & CENTRES', 'Engineering', 'Electrical Engineering', 'https://www.iitrpr.ac.in/ee/', 60),
('DEPARTMENTS & CENTRES', 'Engineering', 'Mechanical Engineering', 'https://mech.iitrpr.ac.in/', 70),
('DEPARTMENTS & CENTRES', 'Engineering', 'Metallurgical and Materials Engineering (MME)', 'https://mme.iitrpr.ac.in/', 80),

('DEPARTMENTS & CENTRES', 'Sciences', 'Chemistry', 'https://www.iitrpr.ac.in/chemistry', 90),
('DEPARTMENTS & CENTRES', 'Sciences', 'Physics', 'https://www.iitrpr.ac.in/physics/', 100),
('DEPARTMENTS & CENTRES', 'Sciences', 'Mathematics', 'https://www.iitrpr.ac.in/math/', 110),

('DEPARTMENTS & CENTRES', 'Humanities', 'Humanities and Social Sciences (HSS)', 'https://www.iitrpr.ac.in/hss/', 120),

('DEPARTMENTS & CENTRES', 'Centers', 'Center for Artificial Intelligence and Robotics in Defense Systems (CARDS)', 'https://www.iitrpr.ac.in/datascience/', 130),
('DEPARTMENTS & CENTRES', 'Centers', 'Center of Excellence for Sustainable Agriculture and Rural Development Systems (CoE-SARDS)', 'https://www.iitrpr.ac.in/coe-sards/', 140),
('DEPARTMENTS & CENTRES', 'Centers', 'Center for Engineering Education (CEE)', 'https://www.iitrpr.ac.in/center-engineering-education', 150),
('DEPARTMENTS & CENTRES', 'Centers', 'Indo-Taiwan Joint Research Center (IT JRC)', 'https://www.iitrpr.ac.in/indo-taiwan/', 160),
('DEPARTMENTS & CENTRES', 'Centers', 'Center for Research in Energy and Environment for Development (CREED)', 'https://iitrpr.ac.in/creed', 170);

INSERT INTO quick_links (section, sub_section, title, url, display_order) VALUES
('Library', NULL, 'Library Portal', 'https://www.iitrpr.ac.in/library/', 10);

INSERT INTO quick_links (section, sub_section, title, url, display_order) VALUES
('Transportation', 'Institute Bus facility', 'Institute Bus facility', 'https://www.iitrpr.ac.in/institute-bus-facility', 10);

-- Note: The instructions say "Auto Drivers (not institute affiliated, student suggestion)"
INSERT INTO quick_links (section, sub_section, title, description, url, display_order) VALUES
('Transportation', 'Auto Drivers', 'Sonu Bhaiya', 'Phone: +91 76268 86478', 'tel:+917626886478', 20),
('Transportation', 'Auto Drivers', 'Banne', 'Phone: +91 86998 20043', 'tel:+918699820043', 30),
('Transportation', 'Auto Drivers', 'Rajvir', 'Phone: +91 98142 14458', 'tel:+919814214458', 40),
('Transportation', 'Auto Drivers', 'Sukhdev', 'Phone: +91 94172 85632', 'tel:+919417285632', 50),
('Transportation', 'Auto Drivers', 'Gurpreet', 'Phone: +91 97798 45123', 'tel:+919779845123', 60),
('Transportation', 'Auto Drivers', 'Harjeet', 'Phone: +91 94635 78912', 'tel:+919463578912', 70);

INSERT INTO quick_links (section, sub_section, title, url, display_order) VALUES
('Calendar', 'Academic', 'Academic Calendar', 'https://www.iitrpr.ac.in/academic-calendar', 10),
('Calendar', 'Holidays', 'Holidays List', 'https://www.iitrpr.ac.in/list-holidays', 20);

INSERT INTO quick_links (section, sub_section, title, url, display_order) VALUES
('Handbook Information', NULL, 'Handbook Information', 'https://www.iitrpr.ac.in/handbook-information', 10),
('AIMS portal', NULL, 'AIMS portal', 'https://iitrpr.ac.in/aims/', 10),
('Institute Official Help Desk', NULL, 'Institute Official Help Desk', 'https://www.iitrpr.ac.in/helpdesk', 10),
('Placements IIT Ropar', NULL, 'Placements IIT Ropar', 'https://placements.iitrpr.ac.in/', 10);

INSERT INTO _migrations (filename) VALUES ('029_quick_links_refactoring.sql');
