package com.ecotrack.admin.dto.request;

import com.ecotrack.common.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRoleRequest {
    @NotNull(message = "Role cannot be null")
    private Role role;
}
