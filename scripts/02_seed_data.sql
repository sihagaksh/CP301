-- =====================================================
-- SEED DATA FOR IIT ROPAR COMMUNITY PLATFORM
-- =====================================================
-- Run after 01_schema.sql
-- =====================================================

-- =====================================================
-- 1. USERS
-- =====================================================

-- =====================================================
-- 2. ORGANIZATIONS (Gymkhana Hierarchy per SRS §3.3-3.5)
-- =====================================================

-- Top-level: Students' Gymkhana
INSERT INTO organizations (id, name, slug, type, parent_id, description, is_active, founded_year, category) VALUES
('10000000-0000-0000-0000-000000000001', 'Students'' Gymkhana', 'students-gymkhana', 'gymkhana', NULL, 'The apex student body of IIT Ropar overseeing all clubs, councils, and extracurricular activities.', TRUE, 2009, 'Governance');

-- Boards (children of Gymkhana)
INSERT INTO organizations (id, name, slug, type, parent_id, description, is_active, category) VALUES
('10000000-0000-0000-0000-000000000010', 'Board of Science and Technology (BOST)', 'bost', 'board', '10000000-0000-0000-0000-000000000001', 'Governs all technical and science clubs at IIT Ropar.', TRUE, 'Technical'),
('10000000-0000-0000-0000-000000000011', 'Board of Cultural Activities (BOCA)', 'boca', 'board', '10000000-0000-0000-0000-000000000001', 'Governs all cultural clubs and organizes Zeitgeist.', TRUE, 'Cultural'),
('10000000-0000-0000-0000-000000000012', 'Board of Literary Activities (BOLA)', 'bola', 'board', '10000000-0000-0000-0000-000000000001', 'Governs all literary, debate, and media clubs and organizes Malhar.', TRUE, 'Literary'),
('10000000-0000-0000-0000-000000000013', 'Board of Sports Affairs (BOSA)', 'bosa', 'board', '10000000-0000-0000-0000-000000000001', 'Governs all sports clubs. Organizes IHL and Aarohan.', TRUE, 'Sports'),
('10000000-0000-0000-0000-000000000014', 'Board of Hostel Affairs (BOHA)', 'boha', 'board', '10000000-0000-0000-0000-000000000001', 'Manages hostel governance, mess committees, and hostel-level events.', TRUE, 'Hostel'),
('10000000-0000-0000-0000-000000000015', 'Board of Academic Affairs (BOAA)', 'boaa', 'board', '10000000-0000-0000-0000-000000000001', 'Branch representatives per batch per year. Academic affairs management.', TRUE, 'Academic');

-- BOST Clubs
INSERT INTO organizations (id, name, slug, type, parent_id, description, is_active, category) VALUES
('20000000-0000-0000-0000-000000000001', 'Aeromodelling Club', 'aeromodelling', 'club', '10000000-0000-0000-0000-000000000010', 'Design, build, and fly model aircraft and drones.', TRUE, 'Technical'),
('20000000-0000-0000-0000-000000000002', 'Automotive Club', 'automotive', 'club', '10000000-0000-0000-0000-000000000010', 'Automotive engineering and electric vehicle projects.', TRUE, 'Technical'),
('20000000-0000-0000-0000-000000000003', 'CIM Club', 'cim', 'club', '10000000-0000-0000-0000-000000000010', 'Computer Integrated Manufacturing.', TRUE, 'Technical'),
('20000000-0000-0000-0000-000000000004', 'Coding Club', 'coding-club', 'club', '10000000-0000-0000-0000-000000000010', 'Competitive programming, open-source dev, and hackathons.', TRUE, 'Technical'),
('20000000-0000-0000-0000-000000000005', 'Esportz Club', 'esportz', 'club', '10000000-0000-0000-0000-000000000010', 'Competitive gaming — BGMI, Valorant, FIFA, Clash Royale.', TRUE, 'Technical'),
('20000000-0000-0000-0000-000000000006', 'FinCOM Club', 'fincom', 'club', '10000000-0000-0000-0000-000000000010', 'Finance and commerce awareness.', TRUE, 'Technical'),
('20000000-0000-0000-0000-000000000007', 'Iota Cluster', 'iota-cluster', 'club', '10000000-0000-0000-0000-000000000010', 'IoT, embedded systems, and hardware projects.', TRUE, 'Technical'),
('20000000-0000-0000-0000-000000000008', 'Monochrome', 'monochrome', 'club', '10000000-0000-0000-0000-000000000010', 'Electronics and circuit design club.', TRUE, 'Technical'),
('20000000-0000-0000-0000-000000000009', 'Robotics Club', 'robotics', 'club', '10000000-0000-0000-0000-000000000010', 'Robotics design, Robocon, autonomous systems.', TRUE, 'Technical'),
('20000000-0000-0000-0000-000000000010', 'Softcom Club', 'softcom', 'club', '10000000-0000-0000-0000-000000000010', 'Software development and web/mobile apps.', TRUE, 'Technical'),
('20000000-0000-0000-0000-000000000011', 'Zenith (Astronomy Club)', 'zenith', 'club', '10000000-0000-0000-0000-000000000010', 'Stargazing, astrophotography, and astronomical events.', TRUE, 'Technical');

-- BOCA Clubs
INSERT INTO organizations (id, name, slug, type, parent_id, description, is_active, category) VALUES
('20000000-0000-0000-0000-000000000020', 'Dance Club', 'dance-club', 'club', '10000000-0000-0000-0000-000000000011', 'All dance forms — contemporary, classical, hip-hop, and choreography.', TRUE, 'Cultural'),
('20000000-0000-0000-0000-000000000021', 'Dramatics Club (Undekha)', 'undekha', 'club', '10000000-0000-0000-0000-000000000011', 'Theatre, street plays, and nukkad natak.', TRUE, 'Cultural'),
('20000000-0000-0000-0000-000000000022', 'Epicure', 'epicure', 'club', '10000000-0000-0000-0000-000000000011', 'Culinary arts and food culture.', TRUE, 'Cultural'),
('20000000-0000-0000-0000-000000000023', 'Fine Arts (Vibgyor)', 'vibgyor', 'club', '10000000-0000-0000-0000-000000000011', 'Painting, sketching, murals, and art installations.', TRUE, 'Cultural'),
('20000000-0000-0000-0000-000000000024', 'Music Club (Alankar)', 'alankar', 'club', '10000000-0000-0000-0000-000000000011', 'Instrumental and vocal music performances.', TRUE, 'Cultural'),
('20000000-0000-0000-0000-000000000025', 'Photography Club (Arturo)', 'arturo', 'club', '10000000-0000-0000-0000-000000000011', 'Photography, videography, and visual storytelling.', TRUE, 'Cultural'),
('20000000-0000-0000-0000-000000000026', 'Dcypher', 'dcypher', 'club', '10000000-0000-0000-0000-000000000011', 'Quizzing, trivia, and puzzle-solving.', TRUE, 'Cultural'),
('20000000-0000-0000-0000-000000000027', 'Panache', 'panache', 'club', '10000000-0000-0000-0000-000000000011', 'Fashion and lifestyle.', TRUE, 'Cultural');

-- BOLA Clubs
INSERT INTO organizations (id, name, slug, type, parent_id, description, is_active, category) VALUES
('20000000-0000-0000-0000-000000000030', 'Debating Society (Debsoc)', 'debsoc', 'club', '10000000-0000-0000-0000-000000000012', 'Parliamentary debate, Asian debate, and public speaking.', TRUE, 'Literary'),
('20000000-0000-0000-0000-000000000031', 'Enarators', 'enarators', 'club', '10000000-0000-0000-0000-000000000012', 'Narration, storytelling, and spoken word.', TRUE, 'Literary'),
('20000000-0000-0000-0000-000000000032', 'Alpha (Movie Making)', 'alpha', 'club', '10000000-0000-0000-0000-000000000012', 'Short films, documentaries, and movie production.', TRUE, 'Literary'),
('20000000-0000-0000-0000-000000000033', 'Filmski', 'filmski', 'club', '10000000-0000-0000-0000-000000000012', 'Film screening, review, and appreciation.', TRUE, 'Literary'),
('20000000-0000-0000-0000-000000000034', 'Enigma', 'enigma', 'club', '10000000-0000-0000-0000-000000000012', 'Mystery, riddles, and cryptic challenges.', TRUE, 'Literary'),
('20000000-0000-0000-0000-000000000035', 'Alfaaz (Creative Writing)', 'alfaaz', 'club', '10000000-0000-0000-0000-000000000012', 'Poetry, prose, and creative writing.', TRUE, 'Literary'),
('20000000-0000-0000-0000-000000000036', 'MUN Club', 'mun-club', 'club', '10000000-0000-0000-0000-000000000012', 'Model United Nations — debate, diplomacy, and policy analysis.', TRUE, 'Literary');

-- BOSA Clubs
INSERT INTO organizations (id, name, slug, type, parent_id, description, is_active, category) VALUES
('20000000-0000-0000-0000-000000000040', 'Aquatics', 'aquatics', 'club', '10000000-0000-0000-0000-000000000013', 'Swimming and water sports.', TRUE, 'Sports'),
('20000000-0000-0000-0000-000000000041', 'Athletics', 'athletics', 'club', '10000000-0000-0000-0000-000000000013', 'Track and field events.', TRUE, 'Sports'),
('20000000-0000-0000-0000-000000000042', 'Badminton', 'badminton', 'club', '10000000-0000-0000-0000-000000000013', 'Badminton club.', TRUE, 'Sports'),
('20000000-0000-0000-0000-000000000043', 'Basketball', 'basketball', 'club', '10000000-0000-0000-0000-000000000013', 'Basketball club.', TRUE, 'Sports'),
('20000000-0000-0000-0000-000000000044', 'Chess', 'chess', 'club', '10000000-0000-0000-0000-000000000013', 'Chess club.', TRUE, 'Sports'),
('20000000-0000-0000-0000-000000000045', 'Cricket', 'cricket', 'club', '10000000-0000-0000-0000-000000000013', 'Cricket club.', TRUE, 'Sports'),
('20000000-0000-0000-0000-000000000046', 'Football', 'football', 'club', '10000000-0000-0000-0000-000000000013', 'Football club.', TRUE, 'Sports'),
('20000000-0000-0000-0000-000000000047', 'Hockey', 'hockey', 'club', '10000000-0000-0000-0000-000000000013', 'Hockey club.', TRUE, 'Sports'),
('20000000-0000-0000-0000-000000000048', 'Lawn Tennis', 'lawn-tennis', 'club', '10000000-0000-0000-0000-000000000013', 'Lawn Tennis club.', TRUE, 'Sports'),
('20000000-0000-0000-0000-000000000049', 'Table Tennis', 'table-tennis', 'club', '10000000-0000-0000-0000-000000000013', 'Table Tennis club.', TRUE, 'Sports'),
('20000000-0000-0000-0000-000000000050', 'Volleyball', 'volleyball', 'club', '10000000-0000-0000-0000-000000000013', 'Volleyball club.', TRUE, 'Sports'),
('20000000-0000-0000-0000-000000000051', 'Weightlifting', 'weightlifting', 'club', '10000000-0000-0000-0000-000000000013', 'Powerlifting and weightlifting.', TRUE, 'Sports');

-- Independent Societies (§3.5)
INSERT INTO organizations (id, name, slug, type, parent_id, description, is_active, category) VALUES
('30000000-0000-0000-0000-000000000001', 'ACE (Association of Civil Engineers)', 'ace', 'society', NULL, 'Association of Civil Engineers.', TRUE, 'Technical'),
('30000000-0000-0000-0000-000000000002', 'E-Cell', 'ecell', 'society', NULL, 'Entrepreneurship Cell — startup culture, pitch events, and mentorship.', TRUE, 'Entrepreneurship'),
('30000000-0000-0000-0000-000000000003', 'ENACTUS IIT Ropar', 'enactus', 'society', NULL, 'Social entrepreneurship projects for community impact.', TRUE, 'Social'),
('30000000-0000-0000-0000-000000000004', 'Pehchaan - Ek Safar', 'pehchaan', 'society', NULL, 'Social welfare and community service.', TRUE, 'Social'),
('30000000-0000-0000-0000-000000000005', 'SME (Society of Mechanical Engineers)', 'sme', 'society', NULL, 'Society of Mechanical Engineers.', TRUE, 'Technical'),
('30000000-0000-0000-0000-000000000006', 'Women''s Forum / SWE', 'womens-forum', 'society', NULL, 'Promoting gender equity and supporting women in STEM.', TRUE, 'Social'),
('30000000-0000-0000-0000-000000000007', 'BloodConnect IIT Ropar', 'bloodconnect', 'society', NULL, 'Blood donation drives and awareness campaigns.', TRUE, 'Social'),
('30000000-0000-0000-0000-000000000008', 'ISMP Body', 'ismp-body', 'society', NULL, 'Institute Student Mentorship Programme — senior-junior mentorship.', TRUE, 'Mentorship');

-- Fest Committees
INSERT INTO organizations (id, name, slug, type, parent_id, description, is_active, category) VALUES
('40000000-0000-0000-0000-000000000001', 'Advitiya (Technical Fest)', 'advitiya', 'fest_committee', '10000000-0000-0000-0000-000000000010', 'Annual Technical Fest — 3 days of workshops, hackathons, and competitions.', TRUE, 'Fest'),
('40000000-0000-0000-0000-000000000002', 'Zeitgeist (Cultural Fest)', 'zeitgeist', 'fest_committee', '10000000-0000-0000-0000-000000000011', 'Annual Cultural Fest, October — 3 days of performances and events.', TRUE, 'Fest'),
('40000000-0000-0000-0000-000000000003', 'Aarohan (Sports Fest)', 'aarohan', 'fest_committee', '10000000-0000-0000-0000-000000000013', 'Annual Sports Fest — 3 days of inter-college competitions.', TRUE, 'Fest'),
('40000000-0000-0000-0000-000000000004', 'Revanche (E-Sports Fest)', 'revanche', 'fest_committee', '10000000-0000-0000-0000-000000000010', 'Annual E-sports/Gaming Fest — BGMI, Valorant, FIFA, COD.', TRUE, 'Fest'),
('40000000-0000-0000-0000-000000000005', 'Malhar (Literature Fest)', 'malhar', 'fest_committee', '10000000-0000-0000-0000-000000000012', 'Annual Literature Fest / Book Fair — 3 days.', TRUE, 'Fest');

-- =====================================================
-- 3. ORG MEMBERS (sample memberships)
-- =====================================================

INSERT INTO org_members (org_id, user_id, status) VALUES
-- Arjun in Coding Club + Gymkhana
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'approved'),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'approved'),
('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'approved'),
-- Priya in Robotics Club + Dance Club
('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', 'approved'),
('20000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000002', 'approved'),
-- Rahul in Automotive Club + Football
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'approved'),
('20000000-0000-0000-0000-000000000046', '00000000-0000-0000-0000-000000000003', 'approved'),
-- Neha in Coding Club
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'approved'),
-- Dr. Singh as Faculty Advisor for BOST
('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000005', 'approved');

-- =====================================================
-- 4. USER POSITIONS (POR assignments)
-- =====================================================

INSERT INTO user_positions (id, user_id, org_id, title, por_type, valid_from, valid_until, is_active) VALUES
-- Arjun: President of Students' Gymkhana + Secretary of Coding Club
('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'President, Students'' Gymkhana', 'president', '2024-08-01', '2025-07-31', TRUE),
('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'Secretary, Coding Club', 'secretary', '2024-08-01', '2025-07-31', TRUE),
-- Priya: Representative of Robotics Club
('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000009', 'Representative, Robotics Club', 'representative', '2024-08-01', '2025-07-31', TRUE),
-- Rahul: Coordinator of Aarohan
('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 'Coordinator, Aarohan', 'coordinator', '2024-08-01', '2025-03-31', TRUE),
-- Dr. Singh: Faculty Advisor of BOST
('50000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000010', 'Faculty Advisor, BOST', 'faculty_advisor', '2024-01-01', '2025-12-31', TRUE);

-- =====================================================
-- 5. LOCATIONS (Campus Infrastructure per SRS §3.7, §16.4)
-- =====================================================

INSERT INTO locations (id, name, code, description, type, latitude, longitude, facilities) VALUES
('60000000-0000-0000-0000-000000000001', 'Lecture Theatre Complex', 'LTC', 'Main lecture hall complex with 6 large theatres, projector equipped.', 'academic', 30.9701, 76.4730, ARRAY['Projectors', 'AC', 'Wi-Fi', 'Mic System']),
('60000000-0000-0000-0000-000000000002', 'Nalanda Library', 'LIB', '24/7 reference access. 22,000+ resources, Koha system, IEEE Xplore.', 'academic', 30.9710, 76.4740, ARRAY['24/7 Reference', 'Wi-Fi', 'Reading Rooms', 'Digital Section', 'Koha OPAC']),
('60000000-0000-0000-0000-000000000003', 'Student Activity Centre', 'SAC', 'Hub for all club rooms — Alankar, BOST Lab, Arturo Studio, Vibgyor Room.', 'recreational', 30.9698, 76.4720, ARRAY['Club Rooms', 'Common Area', 'Wi-Fi']),
('60000000-0000-0000-0000-000000000004', 'Satluj Hostel', 'SAT', 'Boys hostel. Gym, TV room, LAN + Wi-Fi, laundry facilities.', 'hostel', 30.9690, 76.4710, ARRAY['Gym', 'TV Room', 'Wi-Fi', 'LAN', 'Laundry', 'RO Water']),
('60000000-0000-0000-0000-000000000005', 'Beas Hostel', 'BEAS', 'Boys hostel.', 'hostel', 30.9692, 76.4715, ARRAY['Wi-Fi', 'LAN', 'RO Water', 'Laundry']),
('60000000-0000-0000-0000-000000000006', 'Chenab Hostel', 'CHEN', 'Boys hostel with elevator access.', 'hostel', 30.9694, 76.4712, ARRAY['Elevator', 'Wi-Fi', 'LAN', 'RO Water']),
('60000000-0000-0000-0000-000000000007', 'Brahmaputra Hostel', 'BRAH', 'Boys and girls hostel (mixed floors).', 'hostel', 30.9696, 76.4708, ARRAY['Wi-Fi', 'LAN', 'RO Water', 'Laundry']),
('60000000-0000-0000-0000-000000000008', 'Raavi Hostel', 'RAAV', 'Girls hostel. Gym, TV room.', 'hostel', 30.9688, 76.4705, ARRAY['Gym', 'TV Room', 'Wi-Fi', 'LAN', 'RO Water']),
('60000000-0000-0000-0000-000000000009', 'Medical Centre', 'MED', '24/7 first aid, ambulance, allopathic + ayurvedic treatment.', 'medical', 30.9705, 76.4735, ARRAY['24/7 Aid', 'Ambulance', 'Pharmacy']),
('60000000-0000-0000-0000-000000000010', 'Utility Block', 'UTIL', 'General Store (10AM-8PM), Stationery (8AM-8PM), Salon, SBI ATM (24/7), Post Office.', 'other', 30.9702, 76.4725, ARRAY['General Store', 'Stationery', 'Salon', 'SBI ATM', 'Post Office']),
('60000000-0000-0000-0000-000000000011', 'Administrative Block', 'ADMIN', 'Main admin building. Registrar, accounts, and dean offices.', 'administrative', 30.9708, 76.4728, ARRAY['Dean Office', 'Registrar', 'Accounts']),
('60000000-0000-0000-0000-000000000012', 'Sports Complex', 'SPORTS', 'Indoor & outdoor sports facilities. Courts, field, gym.', 'sports', 30.9685, 76.4700, ARRAY['Gym', 'Basketball Court', 'Badminton', 'Cricket Ground', 'Football Field']),
('60000000-0000-0000-0000-000000000013', 'Food Court', 'FOOD', 'Dubey Cafe (till 3AM), Kerala Canteen, Burger House, Juice Corner, Desi Urban Chai, Coffee Day.', 'mess', 30.9699, 76.4718, ARRAY['Dubey Cafe', 'Kerala Canteen', 'Burger House', 'Juice Corner']);

-- =====================================================
-- 6. QUICK LINKS (per SRS §17.2)
-- =====================================================

INSERT INTO quick_links (created_by, title, description, url, category, is_featured, display_order) VALUES
('00000000-0000-0000-0000-000000000007', 'ERP Portal', 'Academic ERP — attendance, grades, registration', 'https://erp.iitrpr.ac.in', 'Academic', TRUE, 1),
('00000000-0000-0000-0000-000000000007', 'Moodle LMS', 'Course content and assignments', 'https://moodle.iitrpr.ac.in', 'Academic', TRUE, 2),
('00000000-0000-0000-0000-000000000007', 'Nalanda Library OPAC', 'Search the library catalog (Koha)', 'https://nalanda.iitrpr.ac.in', 'Library', FALSE, 3),
('00000000-0000-0000-0000-000000000007', 'CDPC Placement Portal', 'Career Development & Placement Cell', 'https://placement.iitrpr.ac.in', 'Placement', TRUE, 4),
('00000000-0000-0000-0000-000000000007', 'IEEE Xplore (via Nalanda)', 'Access IEEE papers through library subscription', 'https://ieeexplore.ieee.org', 'Library', FALSE, 5),
('00000000-0000-0000-0000-000000000007', 'Fee Payment Portal', 'Online fee payment', 'https://fee.iitrpr.ac.in', 'Administrative', FALSE, 6),
('00000000-0000-0000-0000-000000000007', 'Snehita Wellbeing Cell', 'Mental health and counselling support', 'https://snehita.iitrpr.ac.in', 'Wellness', FALSE, 7),
('00000000-0000-0000-0000-000000000007', 'IIT Ropar Official Website', 'Official institute website', 'https://www.iitrpr.ac.in', 'General', TRUE, 8);

-- =====================================================
-- 7. COMMUNITIES (sample)
-- =====================================================

INSERT INTO communities (id, creator_id, name, slug, description, is_public, member_count) VALUES
('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'CP Society', 'cp-society', 'Competitive Programming enthusiasts of IIT Ropar. Weekly contests and discussions.', TRUE, 42),
('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'AI/ML Research Group', 'ai-ml-research', 'Private community for AI/ML researchers and lab members.', FALSE, 15),
('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Batch of 2027', 'batch-2027', 'All 2027 passout students connect here!', TRUE, 180);

INSERT INTO community_members (community_id, user_id, role) VALUES
('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin'),
('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'member'),
('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'admin'),
('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'admin');

-- =====================================================
-- 8. BLOG POSTS (sample)
-- =====================================================

INSERT INTO blog_posts (id, author_id, posting_identity_id, title, slug, content, excerpt, category, tags, company_name, role_applied, status, is_featured, view_count, like_count, comment_count, published_at) VALUES
('80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000008', NULL, 'My Google Interview Experience — SDE New Grad 2023', 'google-interview-experience-2023', 'It was Day 1 of the placement season at IIT Ropar. I had been preparing for months, and Google was my dream company...\n\n## Round 1: Online Assessment\nTwo coding problems — one medium graph problem and one hard DP problem. I solved both within the time limit.\n\n## Round 2: Technical Interview 1\nThe interviewer asked me about system design basics and a tree traversal problem. We discussed time complexity in depth.\n\n## Round 3: Technical Interview 2\nAdvanced DSA — segment trees and string algorithms. The interviewer was very friendly and gave good hints.\n\n## Round 4: HR + Googleyness\nBehavioral questions about teamwork, leadership, and handling conflicts. I mentioned my experience as Coding Club Secretary.\n\n## Tips\n1. Start CP early — at least by 2nd year.\n2. Do not ignore system design.\n3. Mock interviews help immensely.\n4. Stay calm during the interview — it is not just about the answer, it is the approach.', 'Day-1 placement experience at Google. DSA-heavy rounds with system design discussion.', 'placement', ARRAY['google', 'placement', 'dsa', 'day1'], 'Google', 'SDE New Grad', 'published', TRUE, 245, 34, 12, NOW() - INTERVAL '30 days'),

('80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000005', 'A Guide to Choosing Your Research Area in CSE', 'guide-choosing-research-area-cse', 'As a faculty member in the CSE department at IIT Ropar, I often get asked by students about how to choose a research area...\n\n## Step 1: Explore Broadly\nTake diverse electives in your 2nd year. AI/ML, Systems, Theory, Security — try them all before committing.\n\n## Step 2: Read Papers\nStart reading survey papers in areas that interest you. Google Scholar is your friend.\n\n## Step 3: Talk to Faculty\nEvery professor has a different research style. Find someone whose mentorship approach suits you.\n\n## Step 4: Start Small\nDo a semester project before committing to a thesis. A project gives you a taste without the pressure.\n\n## Step 5: Be Patient\nResearch is slow. Your first paper might take 1-2 years. That is normal.', 'Faculty guide on choosing a research area for CSE students.', 'faculty_insight', ARRAY['research', 'cse', 'faculty', 'guide'], NULL, NULL, 'published', FALSE, 89, 15, 5, NOW() - INTERVAL '14 days'),

('80000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'Coding Club Hackathon Winners Announced!', 'coding-club-hackathon-winners', 'The annual 36-hour hackathon organized by the Coding Club just concluded. Over 120 participants across 30 teams competed...\n\n## Theme: Sustainable Campus Solutions\nTeams built solutions for campus problems — smart waste management, energy tracking, study room reservation systems.\n\n## Winners\n1. **Team ByteForce** — Smart Mess Queue Predictor (ML-based)\n2. **Team CodeCraft** — Campus Energy Dashboard\n3. **Team Innovate** — Hostel Maintenance Tracker\n\nCongratulations to all participants! The next hackathon is planned for Advitiya 2025.', 'Annual Coding Club hackathon results and highlights.', 'general', ARRAY['hackathon', 'coding-club', 'advitiya'], NULL, NULL, 'published', FALSE, 156, 28, 8, NOW() - INTERVAL '7 days');

-- =====================================================
-- 9. MARKETPLACE ITEMS (sample)
-- =====================================================

INSERT INTO marketplace_items (id, seller_id, title, description, category, price, is_negotiable, condition, status, images, pickup_location) VALUES
('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Firefox Cycle 26T — Well Maintained', 'Selling my Firefox cycle. Used for 2 years on campus. Gears work perfectly, new tyres last semester.', 'Cycle', 1500.00, TRUE, 'good', 'available', ARRAY['https://placeholder.co/cycle1.jpg'], 'Satluj Hostel Parking'),
('90000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Engineering Mathematics — Erwin Kreyszig (10th Ed)', 'Advanced Engineering Math textbook. Some highlighting but otherwise clean.', 'Books', 250.00, TRUE, 'good', 'available', ARRAY['https://placeholder.co/book1.jpg'], 'Nalanda Library Entrance'),
('90000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Study Table + Chair Combo', 'Wooden study table with cushioned chair. Bought last year, barely used.', 'Furniture', 2000.00, TRUE, 'like_new', 'available', ARRAY['https://placeholder.co/furniture1.jpg'], 'Raavi Hostel Room 304');

-- =====================================================
-- 10. LOST & FOUND (sample)
-- =====================================================

INSERT INTO lost_found_items (reporter_id, item_name, description, category, status, location_lost_found, date_lost_found, contact_info) VALUES
('00000000-0000-0000-0000-000000000004', 'Student ID Card', 'Blue IIT Ropar student ID card with name Neha Gupta. Lost somewhere between LTC and Nalanda Library.', 'Documents', 'lost', 'Between LTC and Nalanda Library', CURRENT_DATE - INTERVAL '2 days', 'neha.gupta@iitrpr.ac.in'),
('00000000-0000-0000-0000-000000000003', 'Black Earphones (Sony)', 'Found black Sony earphones near SAC entrance. Slightly scratched case.', 'Electronics', 'found', 'SAC Main Entrance', CURRENT_DATE - INTERVAL '1 day', 'rahul.verma@iitrpr.ac.in');

-- =====================================================
-- 11. NOTICES (sample)
-- =====================================================

INSERT INTO notices (posted_by, posting_identity_id, title, content, category, priority, tags, target_roles, attachments, is_pinned) VALUES
('00000000-0000-0000-0000-000000000005', NULL, 'Mid-Semester Examination Schedule Released', 'The mid-semester examination schedule for the Spring 2025 semester has been released. Please check the ERP portal for your individual timetable. Key dates:\n\n- Exams begin: March 10, 2025\n- Exams end: March 18, 2025\n- No classes during exam week\n\nAll students must carry their ID cards to the examination hall.', 'Academic', 'high', ARRAY['exams', 'midsem', 'spring2025'], ARRAY['student']::user_role[], ARRAY['https://erp.iitrpr.ac.in/exam-schedule.pdf'], TRUE),

('00000000-0000-0000-0000-000000000007', NULL, 'Hostel Room Allotment for 2025-26', 'Room allotment for the upcoming academic year will begin on June 1, 2025. Students must fill the preference form on the hostel portal by May 15.\n\nPriority:\n1. PhD scholars\n2. M.Tech / M.Sc. students\n3. B.Tech final year\n4. B.Tech pre-final year\n5. Remaining batches', 'Hostel', 'medium', ARRAY['hostel', 'room-allotment'], ARRAY['student']::user_role[], NULL, FALSE),

('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Gymkhana Elections 2025 — Nominations Open', 'The Students'' Gymkhana elections for the academic year 2025-26 are approaching. Nominations are now open for:\n\n- President\n- General Secretaries (all 6 Boards)\n- Research Secretary\n\nLast date for nominations: April 15, 2025. Campaigning begins April 20.\n\nElection Rules and Code of Conduct available on the Gymkhana website.', 'General', 'urgent', ARRAY['elections', 'gymkhana', 'nominations'], ARRAY['student']::user_role[], NULL, TRUE);

-- =====================================================
-- 12. EVENTS (sample)
-- =====================================================

INSERT INTO events (organizer_id, posting_identity_id, title, slug, description, type, start_time, end_time, venue_name, requires_registration, max_participants, organizing_body, target_roles) VALUES
('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'Codeathon 2025 — 36-hr Hackathon', 'codeathon-2025', 'The Coding Club presents Codeathon 2025 — a 36-hour hackathon open to all IIT Ropar students. Build innovative solutions for real campus problems.\n\nPrize pool: ₹50,000\nTeam size: 2-4\n\nTheme will be revealed at the opening ceremony.', 'competition', NOW() + INTERVAL '14 days', NOW() + INTERVAL '15 days' + INTERVAL '12 hours', 'LTC Hall 1 + SAC', TRUE, 120, 'Coding Club, BOST', ARRAY['student']::user_role[]),

('00000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000005', 'Guest Lecture: Quantum Computing Frontiers', 'quantum-computing-lecture', 'Prof. James Wilson from MIT will deliver a guest lecture on recent advances in quantum computing, including quantum error correction and NISQ algorithms.\n\nOpen to all departments. Q&A session after the talk.', 'seminar', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '2 hours', 'LTC Auditorium', FALSE, NULL, 'CSE Department + BOST', ARRAY['student', 'faculty']::user_role[]),

('00000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000004', 'Aarohan 2025 — Opening Ceremony', 'aarohan-2025-opening', 'The annual Sports Fest of IIT Ropar kicks off with a grand opening ceremony! Inter-hostel competitions, celebrity cricket match, and sports quiz.\n\nAll students and faculty are welcome.', 'fest', NOW() + INTERVAL '30 days', NOW() + INTERVAL '32 days', 'Sports Complex + Central Ground', FALSE, NULL, 'Sports Board (BOSA)', NULL);

-- =====================================================
-- 13. FEED POSTS (sample)
-- =====================================================

INSERT INTO feed_posts (author_id, posting_identity_id, content, source_type, like_count) VALUES
('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Excited to announce that the new Student Activity Centre extension will be inaugurated next month! Three new club rooms and a co-working space for startup teams. 🎉', 'post', 24),
('00000000-0000-0000-0000-000000000002', NULL, 'Just finished a 12-hour robotics sprint at SAC. Our autonomous bot finally navigated the obstacle course! 🤖 #RoboticsClub', 'post', 18),
('00000000-0000-0000-0000-000000000004', NULL, 'Anyone know the timing for Kerala Canteen? I heard they extended to 11 PM this semester.', 'post', 5);

-- =====================================================
-- 14. NOTIFICATIONS (sample)
-- =====================================================

INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, action_url) VALUES
('00000000-0000-0000-0000-000000000001', 'New comment on your blog', 'Someone commented on "Coding Club Hackathon Winners Announced!"', 'comment', 'blog_post', '80000000-0000-0000-0000-000000000003', '/blogs/coding-club-hackathon-winners'),
('00000000-0000-0000-0000-000000000002', 'Event reminder', 'Guest Lecture: Quantum Computing Frontiers starts in 24 hours', 'event', 'event', NULL, '/events/quantum-computing-lecture'),
('00000000-0000-0000-0000-000000000004', 'New notice', 'Mid-Semester Examination Schedule Released', 'notice', 'notice', NULL, '/notices');

-- =====================================================
-- SEED DATA COMPLETE
-- =====================================================
