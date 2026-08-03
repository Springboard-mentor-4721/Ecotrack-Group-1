package com.ecotrack.challenge.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class BulkModerateRequest {
    @NotNull
    @Size(min = 1, max = 100)
    private List<Long> ids;

    @NotNull
    private String action;
}
