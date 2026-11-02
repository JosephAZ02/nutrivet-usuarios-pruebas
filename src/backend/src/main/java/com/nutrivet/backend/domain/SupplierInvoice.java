package com.nutrivet.backend.domain;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "supplier_invoice")
public class SupplierInvoice {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	private LocalDate date;
	private double totalAmount;
	private double pendingAmount;
	private String state;
	@Column(name = "invoice_condition") // palabra reservada por mysql condition
	private String condition;
	private Integer period;
	private LocalDate dueDate;
	@Column(name = "electronic_key", unique = true, length = 100)
	private String electronicKey;

	@Column(name = "supplier_id")
	private int idSupplier;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public double getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(double totalAmount) {
		this.totalAmount = totalAmount;
	}

	public double getPendingAmount() {
		return pendingAmount;
	}

	public void setPendingAmount(double pendingAmount) {
		this.pendingAmount = pendingAmount;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getCondition() {
		return condition;
	}

	public void setCondition(String condition) {
		this.condition = condition;
	}

	public Integer getPeriod() {
		return period;
	}

	public void setPeriod(Integer period) {
		this.period = period;
	}

	public LocalDate getDueDate() {
		return dueDate;
	}

	public void setDueDate(LocalDate dueDate) {
		this.dueDate = dueDate;
	}

	public String getElectronicKey() {
		return electronicKey;
	}

	public void setElectronicKey(String electronicKey) {
		this.electronicKey = electronicKey;
	}

	public int getIdSupplier() {
		return idSupplier;
	}

	public void setIdSupplier(int idSupplier) {
		this.idSupplier = idSupplier;
	}
}
