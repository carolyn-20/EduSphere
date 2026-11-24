INSERT INTO users(name,email,password_hash,role) VALUES
('EduSphere Admin','admin@edusphere.local','$2a$10$jleod/TIKRWNVIs7qaMdP.Q5XDU64Nprd4/NI8nb7hyRaq7nyNZ6u','admin'),
('Demo Instructor','instructor@edusphere.local','$2a$10$jleod/TIKRWNVIs7qaMdP.Q5XDU64Nprd4/NI8nb7hyRaq7nyNZ6u','instructor'),
('Demo Learner','learner@edusphere.local','$2a$10$jleod/TIKRWNVIs7qaMdP.Q5XDU64Nprd4/NI8nb7hyRaq7nyNZ6u','learner')
ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash;

INSERT INTO courses(title,description,instructor_id,status)
SELECT seed.title,seed.description,u.id,'published'
FROM (VALUES
 ('Introduction to Python','Learn variables, loops, functions, and problem solving with hands-on examples.'),
 ('Web Design Fundamentals','Build accessible, responsive pages with HTML, CSS, and practical design principles.'),
 ('Data Literacy','Read charts, ask better questions, and make evidence-based decisions.')
) AS seed(title,description)
CROSS JOIN users u
WHERE u.email='instructor@edusphere.local'
  AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.title=seed.title);

INSERT INTO enrollments(learner_id,course_id,status)
SELECT learner.id,c.id,'completed'
FROM users learner CROSS JOIN courses c
WHERE learner.email='learner@edusphere.local'
  AND c.title='Introduction to Python'
ON CONFLICT(learner_id,course_id) DO UPDATE SET status='completed';
