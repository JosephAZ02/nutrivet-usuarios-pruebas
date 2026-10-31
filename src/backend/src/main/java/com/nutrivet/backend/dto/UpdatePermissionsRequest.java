package com.nutrivet.backend.dto;

import java.util.List;

public class UpdatePermissionsRequest {
    private List<Integer> permissionIds;

    public List<Integer> getPermissionIds() {
        return permissionIds;
    }

    public void setPermissionIds(List<Integer> permissionIds) {
        this.permissionIds = permissionIds;
    }
}