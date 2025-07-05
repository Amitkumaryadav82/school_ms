package com.school.exam.model.configuration;

/**
 * Enum representing the type of subject in the education system.
 * This determines how the subject can be configured for examinations.
 */
public enum SubjectType {
    /**
     * Theory subjects - typically knowledge-based subjects with written examinations
     */
    THEORY,
    
    /**
     * Practical subjects - typically skill-based subjects with hands-on examinations
     */
    PRACTICAL,
    
    /**
     * Combined subjects - subjects that have both theory and practical components
     */
    BOTH
}
