package com.pitstop.backend.vehicle;

/**
 * US-16: request body for sharing a vehicle by the recipient's email.
 */
public record ShareRequest(String email) {
}
