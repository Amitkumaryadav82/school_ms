package com.school.fee.dto;

import com.school.fee.model.Fee.FeeType;
import com.school.fee.model.Fee.FeeFrequency;
import javax.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class FeeRequest {
    @NotBlank(message = "Fee name is required")
    private String name;

    @NotNull(message = "Grade is required")
    private Integer grade;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    @NotNull(message = "Due date is required")
    @Future(message = "Due date must be in the future")
    private LocalDate dueDate;

    @NotNull(message = "Fee type is required")
    private FeeType feeType;

    private String description;

    @NotNull(message = "Fee frequency is required")
    private FeeFrequency frequency;
}
