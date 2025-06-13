package com.school.hrm.model;

import com.school.common.model.BaseEntity;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
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
    private HolidayType type;

    // Explicit getter methods to ensure compilation works even if Lombok fails
    @Override
    public Long getId() {
        return super.getId();
    }
    
    public LocalDate getDate() {
        return this.date;
    }
    
    public String getName() {
        return this.name;
    }
    
    public String getDescription() {
        return this.description;
    }
    
    public HolidayType getType() {
        return this.type;
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
}

