package com.school.hrm.model;

import com.school.common.model.BaseEntity;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Table(name = "school_holidays")
public class SchoolHoliday extends BaseEntity {

    @Column(nullable = false, unique = true)
    private LocalDate date;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HolidayType type;    // Explicit getter methods to ensure compilation works even if Lombok fails
    public Long getId() {
        return super.getId();
    }
    
    public LocalDate getDate() {
        return this.date;
    }
    
    public String getName() {
        return name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public HolidayType getType() {
        return type;
    }
    
    // Explicit setter methods to ensure compilation works even if Lombok fails
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public void setType(HolidayType type) {
        this.type = type;
    }
    
    // Static builder method in case Lombok fails
    public static SchoolHolidayBuilder builder() {
        return new SchoolHolidayBuilder();
    }
    
    // Manual builder implementation
    public static class SchoolHolidayBuilder {
        private LocalDate date;
        private String name;
        private String description;
        private HolidayType type;
        
        public SchoolHolidayBuilder date(LocalDate date) { this.date = date; return this; }
        public SchoolHolidayBuilder name(String name) { this.name = name; return this; }
        public SchoolHolidayBuilder description(String description) { this.description = description; return this; }
        public SchoolHolidayBuilder type(HolidayType type) { this.type = type; return this; }
        
        public SchoolHoliday build() {
            SchoolHoliday holiday = new SchoolHoliday();
            holiday.date = this.date;
            holiday.name = this.name;
            holiday.description = this.description;
            holiday.type = this.type;
            return holiday;
        }
    }
}

