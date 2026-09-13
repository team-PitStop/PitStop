package com.pitstop.backend.vehicle;

import com.pitstop.backend.AbstractApiTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * US-3 (add), US-4 (view garage) and US-5 (edit/delete), plus the ownership
 * scoping that keeps one user's garage invisible to another.
 */
class VehicleControllerTest extends AbstractApiTest {

    @Test
    @DisplayName("US-3: a vehicle is added to the caller's garage")
    void addVehicle() throws Exception {
        String token = registerUser("owner@pitstop.app", "password123");

        mockMvc.perform(post("/api/vehicles")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "make", "Honda", "model", "Civic",
                                "year", 2018, "mileage", 82000))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.make").value("Honda"));
    }

    @Test
    @DisplayName("US-4: the garage grid lists vehicles the caller owns")
    void gridListsOwnedVehicles() throws Exception {
        String token = registerUser("owner@pitstop.app", "password123");
        createVehicle(token, "Honda", "Civic", 2018, 82000);
        createVehicle(token, "Toyota", "Tacoma", 2020, 41000);

        mockMvc.perform(get("/api/vehicles/grid").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].shared").value(false));
    }

    @Test
    @DisplayName("US-4: the garage grid never leaks another user's vehicles")
    void gridIsScopedToCaller() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        createVehicle(owner, "Honda", "Civic", 2018, 82000);

        String stranger = registerUser("stranger@pitstop.app", "password123");

        mockMvc.perform(get("/api/vehicles/grid").header("Authorization", bearer(stranger)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("A vehicle is readable by its owner")
    void ownerCanReadVehicle() throws Exception {
        String token = registerUser("owner@pitstop.app", "password123");
        long id = createVehicle(token, "Honda", "Civic", 2018, 82000);

        mockMvc.perform(get("/api/vehicles/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.model").value("Civic"));
    }

    @Test
    @DisplayName("Reading someone else's vehicle by id returns 404")
    void strangerCannotReadVehicle() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long id = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String stranger = registerUser("stranger@pitstop.app", "password123");

        mockMvc.perform(get("/api/vehicles/" + id).header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("US-5: the owner can edit a vehicle")
    void ownerCanUpdateVehicle() throws Exception {
        String token = registerUser("owner@pitstop.app", "password123");
        long id = createVehicle(token, "Honda", "Civic", 2018, 82000);

        mockMvc.perform(put("/api/vehicles/" + id)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "make", "Honda", "model", "Civic Si",
                                "year", 2018, "mileage", 84000,
                                "nickname", "Daily"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.model").value("Civic Si"))
                .andExpect(jsonPath("$.nickname").value("Daily"));
    }

    @Test
    @DisplayName("US-5: a stranger cannot edit a vehicle")
    void strangerCannotUpdateVehicle() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long id = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String stranger = registerUser("stranger@pitstop.app", "password123");

        mockMvc.perform(put("/api/vehicles/" + id)
                        .header("Authorization", bearer(stranger))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "make", "Hacked", "model", "Hacked",
                                "year", 2000, "mileage", 0))))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("US-5: the owner can delete a vehicle")
    void ownerCanDeleteVehicle() throws Exception {
        String token = registerUser("owner@pitstop.app", "password123");
        long id = createVehicle(token, "Honda", "Civic", 2018, 82000);

        mockMvc.perform(delete("/api/vehicles/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/vehicles/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("US-5: a stranger cannot delete a vehicle")
    void strangerCannotDeleteVehicle() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long id = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String stranger = registerUser("stranger@pitstop.app", "password123");

        mockMvc.perform(delete("/api/vehicles/" + id).header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/vehicles/" + id).header("Authorization", bearer(owner)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Vehicle endpoints reject unauthenticated callers")
    void vehicleEndpointsRequireAuth() throws Exception {
        mockMvc.perform(get("/api/vehicles/grid")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("make", "Honda", "model", "Civic",
                                "year", 2018, "mileage", 1))))
                .andExpect(status().isUnauthorized());
    }
}
