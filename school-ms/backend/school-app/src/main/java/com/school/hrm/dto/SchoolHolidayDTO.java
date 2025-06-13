package com.school.hrm.dto;

import com.school.hrm.model.HolidayType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchoolHolidayDTO {
    private Long id;

    @NotNull(message = "Date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @NotBlank(message = "Holiday name is required")
    private String name;

    private String description;

    @NotNull(message = "Holiday type is required")
    private HolidayType type;
    
    // Explicit getter methods to ensure compilation works even if Lombok fails
    public Long getId() {
        return this.id;
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
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    // Builder functionality to support the @Builder annotation
    public static SchoolHolidayDTOBuilder builder() {
        return new SchoolHolidayDTOBuilder();
    }
    
    public static class SchoolHolidayDTOBuilder {
        private Long id;
        private LocalDate date;
        private String name;
        private String description;
        private HolidayType type;
        
        public SchoolHolidayDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }
        
        public SchoolHolidayDTOBuilder date(LocalDate date) {
            this.date = date;
            return this;
        }
        
        public SchoolHolidayDTOBuilder name(String name) {
            this.name = name;
            return this;
        }
        
        public SchoolHolidayDTOBuilder description(String description) {
            this.description = description;
            return this;
        }
        
        public SchoolHolidayDTOBuilder type(HolidayType type) {
            this.type = type;
            return this;
        }
        
        public SchoolHolidayDTO build() {
            SchoolHolidayDTO dto = new SchoolHolidayDTO();
            dto.setId(this.id);
            dto.setDate(this.date);
            dto.setName(this.name);
            dto.setDescription(this.description);
            dto.setType(this.type);
            return dto;
        }
    }
}

