package com.ecotrack.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkActionResult {
    private List<Long> succeeded;
    private List<Long> failed;
}
