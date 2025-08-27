package com.school.settings.dto;

import lombok.Data;

@Data
public class SchoolSettingsDTO {
    private String schoolName;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String phone;
    private String email;
    private String logoUrl;
    private String receiptPrefix;
}
