// ShareVehicleModal.jsx
// US-16: Share a Vehicle with Another User
// A small popup that lets the owner invite someone by email. On submit it POSTs
// to /api/vehicles/{id}/share and reports success or the server's error message.
//
// Props:
//   - isOpen: whether the modal should show
//   - onClose: called when the user cancels / closes
//   - vehicle: the vehicle being shared (used for id + display name)

import { useState } from "react";
import axios from "./api";

function ShareVehicleModal({ isOpen, onClose, vehicle, onShared }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // { type: "success" | "error", message }
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !vehicle) return null;

  const close = () => {
    setEmail("");
    setStatus(null);
    setSubmitting(false);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setSubmitting(true);
    setStatus(null);

    axios
      .post(
        `/api/vehicles/${vehicle.id}/share`,
        { email: email.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setStatus({ type: "success", message: `Shared with ${email.trim()}.` });
        setEmail("");
        setSubmitting(false);
        if (onShared && vehicle) onShared(vehicle.id);
      })
      .catch((err) => {
        const message =
          err.response?.data?.message ||
          "Could not share the vehicle. Please try again.";
        setStatus({ type: "error", message });
        setSubmitting(false);
      });
  };

  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-content" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
        <h3>Share Vehicle</h3>
        <p style={{ color: "var(--text-light)" }}>
          Invite someone to help track maintenance on{" "}
          <strong style={{ color: "var(--text-dark)" }}>{vehicleName}</strong>.
          They'll see it in their garage.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontWeight: 600, color: "var(--fiu-blue)" }}>
            Email address
            <input
              type="email"
              required
              placeholder="their email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {status && (
            <p style={{
              color: status.type === "success" ? "#2e7d32" : "var(--error-red)",
              backgroundColor: status.type === "success" ? "#f1f8f2" : "#fff5f5",
              border: `1px solid ${status.type === "success" ? "#2e7d32" : "var(--error-red)"}`,
              borderRadius: "var(--border-radius)",
              padding: "12px",
              margin: "0 0 8px"
            }}>
              {status.message}
            </p>
          )}

          <div className="modal-buttons" style={{ marginTop: "12px" }}>
            <button type="button" className="btn-outline" onClick={close}>
              Close
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Sharing..." : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShareVehicleModal;
