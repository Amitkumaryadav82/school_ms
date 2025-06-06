# Add necessary table for QuestionWiseMarks

# Create the question_wise_marks table if it doesn't exist
CREATE TABLE IF NOT EXISTS question_wise_marks (
    id SERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id),
    exam_id BIGINT NOT NULL REFERENCES exams(id),
    question_id BIGINT NOT NULL REFERENCES question(id),
    obtained_marks DOUBLE PRECISION NOT NULL,
    evaluator_comments VARCHAR(255),
    is_absent BOOLEAN NOT NULL DEFAULT FALSE,
    absence_reason TEXT,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    locked_by BIGINT,
    locked_at TIMESTAMP,
    was_edited BOOLEAN DEFAULT FALSE,
    edited_by BIGINT,
    edited_at TIMESTAMP,
    edit_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

# Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_question_wise_marks_student ON question_wise_marks(student_id);
CREATE INDEX IF NOT EXISTS idx_question_wise_marks_exam ON question_wise_marks(exam_id);
CREATE INDEX IF NOT EXISTS idx_question_wise_marks_question ON question_wise_marks(question_id);
