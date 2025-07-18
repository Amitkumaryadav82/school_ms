CREATE TABLE blueprint_unit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    marks INT NOT NULL,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL
);

CREATE TABLE blueprint_unit_question (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    unit_id BIGINT NOT NULL,
    count INT NOT NULL,
    marks_per_question INT NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES blueprint_unit(id) ON DELETE CASCADE
);
