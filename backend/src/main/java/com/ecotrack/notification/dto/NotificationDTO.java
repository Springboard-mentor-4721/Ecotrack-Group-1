package com.ecotrack.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String type;
    private String title;
    private String message;
    private String entityType;
    private Long entityId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
