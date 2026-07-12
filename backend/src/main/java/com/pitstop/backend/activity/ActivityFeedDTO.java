package com.pitstop.backend.activity;

import java.time.LocalDate;

/**
 * US-19: Activity Feed for a Shared Vehicle.
 * DTO representing a single activity entry in the feed.
 * Each entry shows: what happened, who did it, and when.
 */
public class ActivityFeedDTO {

    private Long id;
    private String actionType;
    private String performedBy;
    private LocalDate timestamp;

    public ActivityFeedDTO(Long id, String actionType, String performedBy, LocalDate timestamp) {
        this.id = id;
        this.actionType = actionType;
        this.performedBy = performedBy;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public String getActionType() { return actionType; }
    public String getPerformedBy() { return performedBy; }
    public LocalDate getTimestamp() { return timestamp; }
}
