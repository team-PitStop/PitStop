package com.pitstop.backend.vehicle;

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
 * The collaboration sprint: US-16 (share a vehicle), US-17 (see who has access),
 * US-18 (a collaborator logs service), US-20 (accept / decline an invitation),
 * and the permission boundary that keeps edit and delete owner-only.
 */
class VehicleSharingTest extends AbstractApiTest {

    private void share(String ownerToken, long vehicleId, String recipientEmail, int expectedStatus)
            throws Exception {
        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/share")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", recipientEmail))))
                .andExpect(status().is(expectedStatus));
    }

    private long firstPendingInviteId(String token) throws Exception {
        String body = mockMvc.perform(get("/api/vehicles/invitations/pending")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get(0).get("inviteId").asLong();
    }

    private Map<String, Object> serviceBody() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("serviceType", "Oil Change");
        body.put("serviceDate", "2026-06-01");
        body.put("mileage", 82500);
        body.put("cost", "64.99");
        body.put("notes", "logged by collaborator");
        return body;
    }

    @Test
    @DisplayName("US-16: sharing a vehicle by email creates an invitation")
    void shareCreatesInvitation() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        registerUser("friend@pitstop.app", "password123");

        share(owner, vehicleId, "friend@pitstop.app", 201);
    }

    @Test
    @DisplayName("US-16: sharing with an unregistered email returns 404")
    void shareWithUnknownEmailFails() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);

        share(owner, vehicleId, "nobody@pitstop.app", 404);
    }

    @Test
    @DisplayName("US-16: you cannot share a vehicle with yourself")
    void cannotShareWithSelf() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);

        share(owner, vehicleId, "owner@pitstop.app", 400);
    }

    @Test
    @DisplayName("US-16: the same person cannot be invited twice")
    void cannotShareTwice() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        registerUser("friend@pitstop.app", "password123");

        share(owner, vehicleId, "friend@pitstop.app", 201);
        share(owner, vehicleId, "friend@pitstop.app", 400);
    }

    @Test
    @DisplayName("US-16: you cannot share a vehicle you do not own")
    void cannotShareSomeoneElsesVehicle() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String stranger = registerUser("stranger@pitstop.app", "password123");
        registerUser("friend@pitstop.app", "password123");

        share(stranger, vehicleId, "friend@pitstop.app", 404);
    }

    @Test
    @DisplayName("US-20: the recipient sees the invitation as pending")
    void recipientSeesPendingInvite() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String friend = registerUser("friend@pitstop.app", "password123");
        share(owner, vehicleId, "friend@pitstop.app", 201);

        mockMvc.perform(get("/api/vehicles/invitations/pending")
                        .header("Authorization", bearer(friend)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].vehicleName").value("2018 Honda Civic"))
                .andExpect(jsonPath("$[0].ownerEmail").value("owner@pitstop.app"));
    }

    @Test
    @DisplayName("US-20: a pending vehicle stays out of the recipient's garage")
    void pendingVehicleNotInGarage() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String friend = registerUser("friend@pitstop.app", "password123");
        share(owner, vehicleId, "friend@pitstop.app", 201);

        mockMvc.perform(get("/api/vehicles/grid").header("Authorization", bearer(friend)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("US-20: accepting puts the vehicle in the recipient's garage, flagged shared")
    void acceptAddsVehicleToGarage() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String friend = registerUser("friend@pitstop.app", "password123");
        share(owner, vehicleId, "friend@pitstop.app", 201);

        long inviteId = firstPendingInviteId(friend);
        mockMvc.perform(post("/api/vehicles/invitations/" + inviteId + "/accept")
                        .header("Authorization", bearer(friend)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/vehicles/grid").header("Authorization", bearer(friend)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].shared").value(true))
                .andExpect(jsonPath("$[0].model").value("Civic"));
    }

    @Test
    @DisplayName("US-20: declining removes the invitation entirely")
    void declineRemovesInvitation() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String friend = registerUser("friend@pitstop.app", "password123");
        share(owner, vehicleId, "friend@pitstop.app", 201);

        long inviteId = firstPendingInviteId(friend);
        mockMvc.perform(delete("/api/vehicles/invitations/" + inviteId + "/decline")
                        .header("Authorization", bearer(friend)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/vehicles/invitations/pending")
                        .header("Authorization", bearer(friend)))
                .andExpect(jsonPath("$.length()").value(0));
        mockMvc.perform(get("/api/vehicles/grid").header("Authorization", bearer(friend)))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("US-20: you cannot accept an invitation addressed to someone else")
    void cannotAcceptAnotherUsersInvite() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String friend = registerUser("friend@pitstop.app", "password123");
        String stranger = registerUser("stranger@pitstop.app", "password123");
        share(owner, vehicleId, "friend@pitstop.app", 201);

        long inviteId = firstPendingInviteId(friend);
        mockMvc.perform(post("/api/vehicles/invitations/" + inviteId + "/accept")
                        .header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("US-17: the owner sees the full access list for a vehicle")
    void ownerSeesCollaborators() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String friend = registerUser("friend@pitstop.app", "password123");
        share(owner, vehicleId, "friend@pitstop.app", 201);

        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/collaborators")
                        .header("Authorization", bearer(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].role").value("OWNER"))
                .andExpect(jsonPath("$[1].role").value("PENDING"));

        long inviteId = firstPendingInviteId(friend);
        mockMvc.perform(post("/api/vehicles/invitations/" + inviteId + "/accept")
                        .header("Authorization", bearer(friend)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/collaborators")
                        .header("Authorization", bearer(owner)))
                .andExpect(jsonPath("$[1].role").value("MEMBER"));
    }

    @Test
    @DisplayName("US-17: a stranger cannot read a vehicle's access list")
    void strangerCannotSeeCollaborators() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String stranger = registerUser("stranger@pitstop.app", "password123");

        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/collaborators")
                        .header("Authorization", bearer(stranger)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("US-17: the owner can revoke a collaborator's access")
    void ownerCanRemoveCollaborator() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String friend = registerUser("friend@pitstop.app", "password123");
        share(owner, vehicleId, "friend@pitstop.app", 201);
        long inviteId = firstPendingInviteId(friend);
        mockMvc.perform(post("/api/vehicles/invitations/" + inviteId + "/accept")
                        .header("Authorization", bearer(friend)))
                .andExpect(status().isOk());

        String collaborators = mockMvc.perform(get("/api/vehicles/" + vehicleId + "/collaborators")
                        .header("Authorization", bearer(owner)))
                .andReturn().getResponse().getContentAsString();
        long friendId = objectMapper.readTree(collaborators).get(1).get("userId").asLong();

        mockMvc.perform(delete("/api/vehicles/" + vehicleId + "/collaborators/" + friendId)
                        .header("Authorization", bearer(owner)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/vehicles/grid").header("Authorization", bearer(friend)))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("US-18: an accepted collaborator can log service on a shared vehicle")
    void collaboratorCanLogService() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String friend = registerUser("friend@pitstop.app", "password123");
        share(owner, vehicleId, "friend@pitstop.app", 201);
        long inviteId = firstPendingInviteId(friend);
        mockMvc.perform(post("/api/vehicles/invitations/" + inviteId + "/accept")
                        .header("Authorization", bearer(friend)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/service-entries")
                        .header("Authorization", bearer(friend))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(serviceBody())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.createdByEmail").value("friend@pitstop.app"));
    }

    @Test
    @DisplayName("US-19: the owner sees who logged what on a shared vehicle")
    void ownerSeesCollaboratorAttribution() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String friend = registerUser("friend@pitstop.app", "password123");
        share(owner, vehicleId, "friend@pitstop.app", 201);
        long inviteId = firstPendingInviteId(friend);
        mockMvc.perform(post("/api/vehicles/invitations/" + inviteId + "/accept")
                        .header("Authorization", bearer(friend)))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/service-entries")
                        .header("Authorization", bearer(friend))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(serviceBody())))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/service-entries")
                        .header("Authorization", bearer(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].createdByEmail").value("friend@pitstop.app"));
    }

    @Test
    @DisplayName("US-16: a collaborator cannot edit or delete the vehicle itself")
    void collaboratorCannotModifyVehicle() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String friend = registerUser("friend@pitstop.app", "password123");
        share(owner, vehicleId, "friend@pitstop.app", 201);
        long inviteId = firstPendingInviteId(friend);
        mockMvc.perform(post("/api/vehicles/invitations/" + inviteId + "/accept")
                        .header("Authorization", bearer(friend)))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/vehicles/" + vehicleId)
                        .header("Authorization", bearer(friend))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("make", "Nope", "model", "Nope",
                                "year", 2000, "mileage", 1))))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/vehicles/" + vehicleId)
                        .header("Authorization", bearer(friend)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("US-18: a collaborator cannot edit or delete a service entry")
    void collaboratorCannotModifyServiceEntry() throws Exception {
        String owner = registerUser("owner@pitstop.app", "password123");
        long vehicleId = createVehicle(owner, "Honda", "Civic", 2018, 82000);
        String friend = registerUser("friend@pitstop.app", "password123");
        share(owner, vehicleId, "friend@pitstop.app", 201);
        long inviteId = firstPendingInviteId(friend);
        mockMvc.perform(post("/api/vehicles/invitations/" + inviteId + "/accept")
                        .header("Authorization", bearer(friend)))
                .andExpect(status().isOk());

        String created = mockMvc.perform(post("/api/vehicles/" + vehicleId + "/service-entries")
                        .header("Authorization", bearer(friend))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(serviceBody())))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        long entryId = objectMapper.readTree(created).get("id").asLong();

        mockMvc.perform(put("/api/vehicles/" + vehicleId + "/service-entries/" + entryId)
                        .header("Authorization", bearer(friend))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(serviceBody())))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/vehicles/" + vehicleId + "/service-entries/" + entryId)
                        .header("Authorization", bearer(friend)))
                .andExpect(status().isForbidden());
    }
}
