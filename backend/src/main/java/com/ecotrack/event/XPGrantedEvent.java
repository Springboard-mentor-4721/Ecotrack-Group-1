package com.ecotrack.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class XPGrantedEvent {
    private Long userId;
    private Integer xpAmount;
    private Long totalXp;
}
