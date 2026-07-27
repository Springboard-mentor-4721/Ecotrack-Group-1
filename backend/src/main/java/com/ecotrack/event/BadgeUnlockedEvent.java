package com.ecotrack.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BadgeUnlockedEvent {
    private Long userId;
    private Long badgeId;
}
