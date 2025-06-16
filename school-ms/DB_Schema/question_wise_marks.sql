# Add necessary table for QuestionWiseMarks

# Create the question_wise_marks table if it doesn't exist
CREATE TABLE IF NOT EXISTS question_wise_marks (
    id SERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id),
    exam_id BIGINT NOT NULL REFERENCES exams(id),
    question_id BIGINT NOT NULL REFERENCES question(id),
    obtained_marks DOUBLE PRECISION NOT NULL,
    evaluator_comments VARCHAR(255),
    -- Additional fields follow in the original file
)
