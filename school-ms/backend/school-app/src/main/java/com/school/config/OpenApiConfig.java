package com.school.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springdoc.core.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

        @Bean
        public OpenAPI schoolOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("School Management System API")
                                                .description("Comprehensive API documentation for School Management System")
                                                .version("1.0")
                                                .contact(new Contact()
                                                                .name("School Management System")
                                                                .email("support@schoolms.com")))
                                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                                .components(new io.swagger.v3.oas.models.Components()
                                                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                                                .type(SecurityScheme.Type.HTTP)
                                                                .scheme("bearer")
                                                                .bearerFormat("JWT")));
        }        // This bean ensures all API groups are included in the Swagger documentation
        @Bean
        public GroupedOpenApi allApisGroup() {
                return GroupedOpenApi.builder()
                                .group("all-apis")
                                .packagesToScan("com.school")
                                .pathsToMatch("/api/**")
                                .build();
        }        // Specific API group for staff management
        @Bean
        public GroupedOpenApi staffManagementGroup() {
                return GroupedOpenApi.builder()
                                .group("staff-management")
                                .packagesToScan("com.school.core.controller")
                                .pathsToMatch("/api/staff/**")
                                .build();
        }
        
        // Specific API group for course management
        @Bean
        public GroupedOpenApi courseManagementGroup() {
                return GroupedOpenApi.builder()
                                .group("course-management")
                                .packagesToScan("com.school.course.controller")
                                .pathsToMatch("/api/courses/**")
                                .build();
        }
}