-- Enable foreign key support in SQLite
PRAGMA foreign_keys = ON;

-- ========================================================
-- STEP 2: CREATE TABLE STATEMENTS
-- ========================================================

-- 1. Create Students Table
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL UNIQUE
);

-- 2. Create Courses Table
CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_name TEXT NOT NULL
);

-- 3. Create Enrollments Table (Links Students and Courses)
CREATE TABLE enrollments (
    student_id INTEGER,
    course_id INTEGER,
    grade TEXT,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- ========================================================
-- STEP 3: INSERT SAMPLE DATA
-- ========================================================

-- Insert 3 Students
INSERT INTO students (student_name, student_email) VALUES 
('Alice Smith', 'alice@example.com'),
('Bob Jones', 'bob@example.com'),
('Charlie Brown', 'charlie@example.com');

-- Insert 3 Courses
INSERT INTO courses (course_name) VALUES 
('Introduction to SQL'),
('Web Development 101'),
('Data Structures');

-- Insert 5 Enrollments
INSERT INTO enrollments (student_id, course_id, grade) VALUES 
(1, 1, 'A'), 
(1, 2, 'B'), 
(2, 1, 'B+'),
(2, 3, 'A-'),
(3, 2, 'C');

-- ========================================================
-- STEP 4: WRITE THE FIVE QUERIES
-- ========================================================

-- Query 1: All courses for one student (by name)
SELECT c.course_name, e.grade
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN courses c ON e.course_id = c.course_id
WHERE s.student_name = 'Alice Smith';

-- Query 2: All students on one course
SELECT s.student_name, s.student_email
FROM courses c
JOIN enrollments e ON c.course_id = e.course_id
JOIN students s ON e.student_id = s.student_id
WHERE c.course_name = 'Introduction to SQL';

-- Query 3: The number of students per course
SELECT c.course_name, COUNT(e.student_id) AS student_count
FROM courses c
LEFT JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_name;

-- Query 4: Students who have no enrollments
SELECT s.student_name, s.student_email
FROM students s
LEFT JOIN enrollments e ON s.student_id = e.student_id
WHERE e.student_id IS NULL;

-- Query 5: Update of one enrollment's grade
UPDATE enrollments
SET grade = 'A+'
WHERE student_id = (SELECT student_id FROM students WHERE student_name = 'Alice Smith')
  AND course_id = (SELECT course_id FROM courses WHERE course_name = 'Introduction to SQL');
