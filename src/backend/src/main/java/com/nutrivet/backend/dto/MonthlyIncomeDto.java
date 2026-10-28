
package com.nutrivet.backend.dto;

public class MonthlyIncomeDto {

    private int month;
    private double total;
    private int cantInvoices;

    public MonthlyIncomeDto(int month, double total, int cantInvoices) {
        this.month = month;
        this.total = total;
        this.cantInvoices = cantInvoices;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public int getCantInvoices() {
        return cantInvoices;
    }

    public void setCantInvoices(int cantInvoices) {
        this.cantInvoices = cantInvoices;
    }
}
