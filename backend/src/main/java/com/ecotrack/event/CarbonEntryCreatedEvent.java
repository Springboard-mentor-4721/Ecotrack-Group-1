package com.ecotrack.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarbonEntryCreatedEvent {
    private Long userId;
    private Long entryId;
    private Long subCategoryId;
}
