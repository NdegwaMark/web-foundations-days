# School Database Design

## Table Explanations & Relationships
- **students**: Stores core student identifiers (`student_id`, `student_name`, `student_email`). The email column enforces a `UNIQUE` constraint to prevent double registrations.
- **courses**: Stores available course tracks (`course_id`, `course_name`).
- **enrollments**: Connects students to courses. This is a **many-to-many** design because a single student can take multiple courses, and a single course holds multiple students.

## Why a Join Table is Needed
Relational theory prohibits storing multi-valued arrays directly inside a student or course record. The `enrollments` table acts as a join table, breaking down the complex many-to-many relationship into two clean, manageable one-to-many links. This allows us to track attributes unique to the match, like the specific `grade` earned by a student in that exact course.

## Performance Indexing
```sql
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
```
*Reasoning*: SQLite automatically indexes our composite primary key `(student_id, course_id)`, optimization runs natively when looking up data filtered by a student. However, searching files by a specific course (such as listing all students enrolled in a class) forces a full sequential table scan. Adding this explicit index speeds up aggregation joins targeting courses.

## Architectural Choice: SQL vs NoSQL
For this academic system, **SQL** is the appropriate choice. School environments demand strict transactional consistency and strict validation structures (ACID compliance) to guarantee that grades never mismatch or link to non-existent students. NoSQL structures lack built-in relational rules, increasing the risk of orphaned data entries.
