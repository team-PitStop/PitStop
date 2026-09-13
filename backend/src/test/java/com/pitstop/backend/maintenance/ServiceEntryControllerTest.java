package com.pitstop.backend.maintenance;

import com.pitstop.backend.AbstractApiTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * US-6 (log a service), US-7 (view history), US-8 (edit/delete) and US-10
 * (a service log pushes the vehicle's mileage forward).
 */
class ServiceEntryControllerTest extends AbstractApiTest {

    private Map<String, Object> entry(String type, String date, int mileage, String cost, String notes) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("serviceType", type);
        body.put("serviceDate", date);
        body.put("mileage", mileage);
        body.put("cost", cost);
        body.put("notes", notes);
        return body;
    }

    private long logService(String token, long vehicleId, Map<String, Object> body) throws Exception {
        String response = mockMvc.perform(post("/api/vehicles/" + vehicleId + "/service-entries")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(body)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    @Test
    @DisplayName("US-6: a service entry is recorded against its vehicle")
    void logServiceEntry() throws Exception {
        String token = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(token, "Honda", "Civic", 2018, 82000);

        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/service-entries")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(entry("Oil Change", "2026-06-01", 82500, "64.99", "Synthetic"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serviceType").value("Oil Change"))
                .andExpect(jsonPath("$.createdByEmail").value("owner@pitstop.app"));
    }

    @Test
    @DisplayName("US-7: history comes back newest service first")
    void historyIsOrderedNewestFirst() throws Exception {
        String token = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(token, "Honda", "Civic", 2018, 82000);

        logService(token, vehicleId, entry("Oil Change", "2026-01-10", 80000, "59.99", "older"));
        logService(token, vehicleId, entry("Brakes", "2026-06-01", 82500, "310.00", "newer"));

        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/service-entries")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].serviceType").value("Brakes"))
                .andExpect(jsonPath("$[1].serviceType").value("Oil Change"));
    }

    @Test
    @DisplayName("US-10: logging a higher mileage advances the vehicle's odometer")
    void serviceEntryAdvancesVehicleMileage() throws Exception {
        String token = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(token, "Honda", "Civic", 2018, 82000);

        logService(token, vehicleId, entry("Oil Change", "2026-06-01", 86000, "64.99", null));

        mockMvc.perform(get("/api/vehicles/" + vehicleId).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mileage").value(86000));
    }

    @Test
    @DisplayName("US-10: back-dated lower mileage never rolls the odometer back")
    void lowerMileageDoesNotRollBackVehicle() throws Exception {
        String token = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(token, "Honda", "Civic", 2018, 82000);

        logService(token, vehicleId, entry("Tire Rotation", "2025-11-01", 70000, "25.00", null));

        mockMvc.perform(get("/api/vehicles/" + vehicleId).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mileage").value(82000));
    }

    @Test
    @DisplayName("US-8: the owner can edit a service entry")
    void ownerCanEditEntry() throws Exception {
        String token = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(token, "Honda", "Civic", 2018, 82000);
        long entryId = logService(token, vehicleId, entry("Oil Change", "2026-06-01", 82500, "64.99", "Synthetic"));

        mockMvc.perform(put("/api/vehicles/" + vehicleId + "/service-entries/" + entryId)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(entry("Oil Change", "2026-06-02", 82600, "72.50", "Full synthetic"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes").value("Full synthetic"));
    }

    @Test
    @DisplayName("US-8: the owner can delete a service entry")
    void ownerCanDeleteEntry() throws Exception {
        String token = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(token, "Honda", "Civic", 2018, 82000);
        long entryId = logService(token, vehicleId, entry("Oil Change", "2026-06-01", 82500, "64.99", null));

        mockMvc.perform(delete("/api/vehicles/" + vehicleId + "/service-entries/" + entryId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/service-entries")
                        .header("Authorization", bearer(token)))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("A stranger cannot read another vehicle's service history")
    void strangerCannotReadHistory() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        logService(owner, vehicleId, entry("Oil Change", "2026-06-01", 82500, "64.99", null));

        String stranger = registerUser("stranger@pitstop.app", "password123");

        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/service-entries")
                        .header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("A stranger cannot log service against another vehicle")
    void strangerCannotLogService() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String stranger = registerUser("stranger@pitstop.app", "password123");

        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/service-entries")
                        .header("Authorization", bearer(stranger))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(entry("Oil Change", "2026-06-01", 82500, "64.99", null))))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Service history requires authentication")
    void historyRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/vehicles/1/service-entries"))
                .andExpect(status().isUnauthorized());
    }
}
