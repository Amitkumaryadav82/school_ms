package com.school.fee.dto;

public class OverdueAnalytics {
    private int totalOverdueCount;
    private double totalOverdueAmount;
    private double averageOverdueDays;
    private int overdueByLessThan30Days;
    private int overdueBy30To60Days;
    private int overdueBy60To90Days;
    private int overdueByMoreThan90Days;

    public int getTotalOverdueCount() {
        return totalOverdueCount;
    }

    public void setTotalOverdueCount(int totalOverdueCount) {
        this.totalOverdueCount = totalOverdueCount;
    }

    public double getTotalOverdueAmount() {
        return totalOverdueAmount;
    }

    public void setTotalOverdueAmount(double totalOverdueAmount) {
        this.totalOverdueAmount = totalOverdueAmount;
    }

    public double getAverageOverdueDays() {
        return averageOverdueDays;
    }

    public void setAverageOverdueDays(double averageOverdueDays) {
        this.averageOverdueDays = averageOverdueDays;
    }

    public int getOverdueByLessThan30Days() {
        return overdueByLessThan30Days;
    }

    public void setOverdueByLessThan30Days(int overdueByLessThan30Days) {
        this.overdueByLessThan30Days = overdueByLessThan30Days;
    }

    public int getOverdueBy30To60Days() {
        return overdueBy30To60Days;
    }

    public void setOverdueBy30To60Days(int overdueBy30To60Days) {
        this.overdueBy30To60Days = overdueBy30To60Days;
    }

    public int getOverdueBy60To90Days() {
        return overdueBy60To90Days;
    }

    public void setOverdueBy60To90Days(int overdueBy60To90Days) {
        this.overdueBy60To90Days = overdueBy60To90Days;
    }

    public int getOverdueByMoreThan90Days() {
        return overdueByMoreThan90Days;
    }

    public void setOverdueByMoreThan90Days(int overdueByMoreThan90Days) {
        this.overdueByMoreThan90Days = overdueByMoreThan90Days;
    }
}
