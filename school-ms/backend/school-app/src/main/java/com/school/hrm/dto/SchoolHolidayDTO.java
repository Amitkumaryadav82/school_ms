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
    
    // Explicit getters and setters in case Lombok fails
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public HolidayType getType() { return type; }
    public void setType(HolidayType type) { this.type = type; }

    // Static builder method in case Lombok fails
    public static SchoolHolidayDTOBuilder builder() {
        return new SchoolHolidayDTOBuilder();
    }

    // Manual builder implementation
    public static class SchoolHolidayDTOBuilder {
        private Long id;
        private LocalDate date;
        private String name;
        private String description;
        private HolidayType type;

        public SchoolHolidayDTOBuilder id(Long id) { this.id = id; return this; }
        public SchoolHolidayDTOBuilder date(LocalDate date) { this.date = date; return this; }
        public SchoolHolidayDTOBuilder name(String name) { this.name = name; return this; }
        public SchoolHolidayDTOBuilder description(String description) { this.description = description; return this; }
        public SchoolHolidayDTOBuilder type(HolidayType type) { this.type = type; return this; }

        public SchoolHolidayDTO build() {
            SchoolHolidayDTO dto = new SchoolHolidayDTO();
            dto.id = this.id;
            dto.date = this.date;
            dto.name = this.name;
            dto.description = this.description;
            dto.type = this.type;
            return dto;
        }
    }
}

