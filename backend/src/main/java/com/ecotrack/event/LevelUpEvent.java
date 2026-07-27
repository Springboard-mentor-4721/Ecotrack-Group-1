package com.ecotrack.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LevelUpEvent {
    private Long userId;
    private Integer oldLevel;
    private Integer newLevel;
}
