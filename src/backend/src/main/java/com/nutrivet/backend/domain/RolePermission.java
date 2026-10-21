package com.nutrivet.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "role_permission")
public class RolePermission {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int role_permission_id;

	@Column(name = "role_id")
	private int idRole;
	@Column(name = "permission_id")
	private int idPermission;

	public int getRole_permission_id() {
		return role_permission_id;
	}

	public void setRole_permission_id(int role_permission_id) {
		this.role_permission_id = role_permission_id;
	}

	public int getIdRole() {
		return idRole;
	}

	public void setIdRole(int idRole) {
		this.idRole = idRole;
	}

	public int getIdPermission() {
		return idPermission;
	}

	public void setIdPermission(int idPermission) {
		this.idPermission = idPermission;
	}
}
