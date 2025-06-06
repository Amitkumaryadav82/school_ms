package com.school.fee.controller;

import com.school.fee.dto.*;
import com.school.fee.service.FeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/fees/analytics")
@Tag(name = "Fee Analytics", description = "APIs for fee analytics and reporting")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000",
        "http://localhost:8080" }, allowedHeaders = "*", allowCredentials = "true", exposedHeaders = {
                "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials" }, methods = { RequestMethod.GET,
                        RequestMethod.POST, RequestMethod.PUT,
                        RequestMethod.DELETE, RequestMethod.OPTIONS, RequestMethod.PATCH })
public class FeeAnalyticsController {

    @Autowired
    private FeeService feeService;

    /**
     * Explicitly handle OPTIONS requests for this controller.
     * This ensures that preflight requests are handled correctly.
     */
    @RequestMapping(method = RequestMethod.OPTIONS)
    @ResponseStatus(org.springframework.http.HttpStatus.OK)
    public void handleOptions(HttpServletRequest request, HttpServletResponse response) {
        String origin = request.getHeader("Origin");
        response.setHeader("Access-Control-Allow-Origin", origin != null ? origin : "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "3600");

        System.out.println("Handling OPTIONS preflight for: " + request.getRequestURI() +
                " from origin: " + origin);
    }

    @Operation(summary = "Get analytics summary", description = "Retrieves a summary of fee analytics")
    @ApiResponse(responseCode = "200", description = "Analytics retrieved successfully")
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummary> getAnalyticsSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {

        // DEBUG: Log the incoming request
        System.out.println("Analytics request from: " + request.getRemoteAddr() +
                ", Method: " + request.getMethod() +
                ", URI: " + request.getRequestURI() +
                ", Query: " + request.getQueryString());

        // DEBUG: Log all request headers
        java.util.Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            System.out.println("  Header: " + headerName + " = " + request.getHeader(headerName));
        } // For debugging
        System.out.println("Analytics request received from origin: " + request.getHeader("Origin"));
        System.out.println("Request params: startDate=" + startDate + ", endDate=" + endDate);
        System.out.println("Processing request with dates: " + startDate + " to " + endDate);

        // For now, return placeholder data
        // In a real implementation, you would call the fee service
        AnalyticsSummary summary = createPlaceholderAnalyticsSummary();
        return ResponseEntity.ok(summary);
    }

    @Operation(summary = "Get monthly analytics", description = "Retrieves fee analytics for a specific month")
    @ApiResponse(responseCode = "200", description = "Analytics retrieved successfully")
    @GetMapping("/monthly/{year}/{month}")
    public ResponseEntity<AnalyticsSummary> getMonthlyAnalytics(
            @PathVariable Integer year,
            @PathVariable Integer month) {
        // For now, return placeholder data
        // In a real implementation, you would call the fee service
        AnalyticsSummary summary = createPlaceholderAnalyticsSummary();
        return ResponseEntity.ok(summary);
    }

    @Operation(summary = "Get class analytics", description = "Retrieves fee analytics for a specific class")
    @ApiResponse(responseCode = "200", description = "Analytics retrieved successfully")
    @GetMapping("/class/{classGrade}")
    public ResponseEntity<AnalyticsSummary> getClassAnalytics(
            @PathVariable Integer classGrade,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        // For now, return placeholder data
        // In a real implementation, you would call the fee service
        AnalyticsSummary summary = createPlaceholderAnalyticsSummary();
        return ResponseEntity.ok(summary);
    }

    @Operation(summary = "Get payment analytics", description = "Retrieves analytics for payments")
    @ApiResponse(responseCode = "200", description = "Analytics retrieved successfully")
    @GetMapping("/payments")
    public ResponseEntity<PaymentAnalytics> getPaymentAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        // Placeholder implementation
        PaymentAnalytics analytics = new PaymentAnalytics();
        // Set placeholder values
        return ResponseEntity.ok(analytics);
    }

    @Operation(summary = "Get payment distribution", description = "Retrieves distribution of payments")
    @ApiResponse(responseCode = "200", description = "Distribution retrieved successfully")
    @GetMapping("/distribution")
    public ResponseEntity<List<PaymentDistribution>> getPaymentDistribution(
            @RequestParam(required = false) String academicYear) {
        // Placeholder implementation
        List<PaymentDistribution> distributions = new ArrayList<>();
        // Add placeholder distributions
        return ResponseEntity.ok(distributions);
    }

    @Operation(summary = "Get revenue trend", description = "Retrieves revenue trend over time")
    @ApiResponse(responseCode = "200", description = "Trend retrieved successfully")
    @GetMapping("/revenue-trend")
    public ResponseEntity<List<RevenueTrendItem>> getRevenueTrend(
            @RequestParam(defaultValue = "monthly") String period,
            @RequestParam(required = false) Integer year) {
        // Placeholder implementation
        List<RevenueTrendItem> trends = new ArrayList<>();
        // Add placeholder trends
        return ResponseEntity.ok(trends);
    }

    @Operation(summary = "Get overdue analytics", description = "Retrieves analytics for overdue payments")
    @ApiResponse(responseCode = "200", description = "Analytics retrieved successfully")
    @GetMapping("/overdue")
    public ResponseEntity<OverdueAnalytics> getOverdueAnalytics() {
        // Placeholder implementation
        OverdueAnalytics analytics = new OverdueAnalytics();
        // Set placeholder values
        return ResponseEntity.ok(analytics);
    }

    @Operation(summary = "Get outstanding fees", description = "Retrieves students with outstanding fees")
    @ApiResponse(responseCode = "200", description = "Outstanding fees retrieved successfully")
    @GetMapping("/outstanding")
    public ResponseEntity<List<PaymentSummary>> getStudentsWithOutstandingFees(
            @RequestParam(required = false) Integer gradeLevel) {
        // Placeholder implementation
        List<PaymentSummary> summaries = new ArrayList<>();
        // Add placeholder summaries
        return ResponseEntity.ok(summaries);
    }

    // Helper method to create placeholder analytics data
    private AnalyticsSummary createPlaceholderAnalyticsSummary() {
        AnalyticsSummary summary = new AnalyticsSummary();
        summary.setTotalRevenue(50000.0);
        summary.setTotalPendingAmount(15000.0);
        summary.setOverallCollectionRate(0.75);
        summary.setOutstandingAmount(10000.0);
        summary.setLateFeesCollected(2500.0);

        // Add placeholder monthly trends
        List<MonthlyTrend> trends = new ArrayList<>();
        MonthlyTrend trend = new MonthlyTrend();
        trend.setMonth("January");
        trend.setCollected(5000.0);
        trend.setDue(6000.0);
        trend.setCollectionRate(0.83);
        trends.add(trend);

        // Add more months as needed...
        summary.setMonthlyTrends(trends);

        // Add placeholder payment method distribution
        List<PaymentMethodDistribution> distributions = new ArrayList<>();
        PaymentMethodDistribution dist1 = new PaymentMethodDistribution();
        dist1.setMethod("Credit Card");
        dist1.setAmount(30000.0);
        dist1.setPercentage(0.6);
        distributions.add(dist1);

        // Add more methods as needed...
        summary.setPaymentMethodDistribution(distributions);

        // Add placeholder class-wise collection data
        List<ClassWiseCollection> classCollections = new ArrayList<>();
        ClassWiseCollection class1 = new ClassWiseCollection();
        class1.setGrade(1);
        class1.setCollected(10000.0);
        class1.setDue(12000.0);
        class1.setCollectionRate(0.83);
        class1.setStudentCount(30);
        classCollections.add(class1);

        // Add more grades as needed...
        summary.setClassWiseCollection(classCollections);

        return summary;
    }
}

