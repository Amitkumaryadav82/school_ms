package com.school.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransportRouteDTO {
    private Long id;
    private String routeName;
    private String routeDescription;
    private BigDecimal feeAmount;
}