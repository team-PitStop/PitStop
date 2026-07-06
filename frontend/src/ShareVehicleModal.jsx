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
import axios from "axios";

function ShareVehicleModal({ isOpen, onClose, vehicle }) {
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
        `http://localhost:8080/api/vehicles/${vehicle.id}/share`,
        { email: email.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setStatus({ type: "success", message: `Shared with ${email.trim()}.` });
        setEmail("");
        setSubmitting(false);
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Share Vehicle</h3>
        <p>
          Invite someone to help track maintenance on{" "}
          <strong>{vehicleName}</strong>. They'll see it in their garage.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="their email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />

          {status && (
            <p style={{ color: status.type === "success" ? "green" : "crimson", marginTop: "8px" }}>
              {status.message}
            </p>
          )}

          <div className="modal-buttons" style={{ marginTop: "12px" }}>
            <button type="button" className="btn-cancel" onClick={close}>
              Close
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "Sharing..." : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShareVehicleModal;
