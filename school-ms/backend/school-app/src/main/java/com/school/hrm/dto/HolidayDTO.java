package com.school.hrm.dto;

import com.school.hrm.model.Holiday.HolidayType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HolidayDTO {
    private Long id;
    
    @NotNull
    private LocalDate date;
    
    @NotBlank
    private String name;
    
    private String description;
    
    @NotNull
    private HolidayType type;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
