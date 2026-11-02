package com.nutrivet.backend.dto;

import java.time.LocalDate;

public class SupplierInvoiceReviewRequest {

    private String condition;
    private int period;
    private LocalDate dueDate;

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public int getPeriod() {
        return period;
    }

    public void setPeriod(int period) {
        this.period = period;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}
