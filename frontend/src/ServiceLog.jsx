// ServiceLog.jsx (UPDATED for US-8 and shared vehicle access)
//
// Changes:
//   1. Display creator email for each service entry
//   2. Allow shared users (collaborators) to view and create entries
//   3. Only show edit/delete buttons if the current user is the vehicle owner
//   4. Display "Created by" information on each entry

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

// US-9: Full Catalog of Common Services
const serviceTypes = [
  { value: "OIL_CHANGE", label: "Oil Change" },
  { value: "TIRE_ROTATION", label: "Tire Rotation" },
  { value: "BRAKE_SERVICE", label: "Brake Service" },
  { value: "BATTERY", label: "Battery" },
  { value: "AIR_FILTER", label: "Air Filter" },
  { value: "TRANSMISSION", label: "Transmission" },
  { value: "COOLANT", label: "Coolant" },
  { value: "INSPECTION", label: "Inspection" },
  { value: "OTHER", label: "Other (Custom)" },
];

function ServiceLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    serviceType: "OIL_CHANGE",
    serviceDate: "",
    mileage: "",
    cost: "",
    notes: "",
  });
  const [customType, setCustomType] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // US-8: State for the delete confirmation modal
  const [entryToDelete, setEntryToDelete] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch all vehicles to determine if this user is the owner
    axios
        .get("http://localhost:8080/api/vehicles/grid", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const vehicle = response.data.find((v) => v.id === parseInt(id, 10));
          if (vehicle) {
            setIsOwner(!vehicle.shared);
          }
        })
        .catch((err) => {
          console.error("Error fetching vehicle grid:", err);
        });

    // Fetch service entries
    axios
        .get(`http://localhost:8080/api/vehicles/${id}/service-entries`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setEntries(response.data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          alert("Could not load service entries.");
        });
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.serviceDate) newErrors.serviceDate = "Date is required";
    if (!form.mileage) newErrors.mileage = "Mileage is required";
    if (!form.cost) newErrors.cost = "Cost is required";
    if (form.serviceType === "OTHER" && !customType.trim()) {
      newErrors.customType = "Please specify the service name";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalServiceType =
        form.serviceType === "OTHER" ? customType : form.serviceType;

    const token = localStorage.getItem("token");
    axios
        .post(
            `http://localhost:8080/api/vehicles/${id}/service-entries`,
            {
              serviceType: finalServiceType,
              serviceDate: form.serviceDate,
              mileage: parseInt(form.mileage, 10),
              cost: parseFloat(form.cost),
              notes: form.notes,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          setEntries((prev) => [response.data, ...prev]);
          setForm({
            serviceType: "OIL_CHANGE",
            serviceDate: "",
            mileage: "",
            cost: "",
            notes: "",
          });
          setCustomType("");
          setErrors({});
        })
        .catch(() => alert("Could not save service entry."));
  };

  // US-8: Edit and Delete handlers
  const handleEditClick = (entryId) => {
    navigate(`/vehicles/${id}/service-entries/${entryId}/edit`);
  };

  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
  };

  const handleCancelDelete = () => {
    setEntryToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!entryToDelete) return;

    const token = localStorage.getItem("token");
    axios
        .delete(
            `http://localhost:8080/api/vehicles/${id}/service-entries/${entryToDelete.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          setEntries((prev) =>
              prev.filter((e) => e.id !== entryToDelete.id)
          );
          setEntryToDelete(null);
        })
        .catch(() => {
          alert("Could not delete service entry.");
          setEntryToDelete(null);
        });
  };

  if (loading) return <p>Loading service log...</p>;

  return (
      <div style={{ padding: "40px" }}>
        <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
        >
          <h2>Service Log</h2>
          <button onClick={() => navigate("/garage")}>Back to Garage</button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: "32px", maxWidth: "520px" }}>
          <label>
            Service Type *
            <select name="serviceType" value={form.serviceType} onChange={handleChange}>
              {serviceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
              ))}
            </select>
          </label>

          {form.serviceType === "OTHER" && (
              <label style={{ marginTop: "10px", display: "block" }}>
                Custom Service Name *
                <input
                    type="text"
                    placeholder="Enter service name"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                />
                {errors.customType && (
                    <span style={{ color: "red" }}>{errors.customType}</span>
                )}
              </label>
          )}

          <label style={{ display: "block", marginTop: "10px" }}>
            Date *
            <input
                type="date"
                name="serviceDate"
                value={form.serviceDate}
                onChange={handleChange}
            />
            {errors.serviceDate && (
                <span style={{ color: "red" }}>{errors.serviceDate}</span>
            )}
          </label>

          <label style={{ display: "block", marginTop: "10px" }}>
            Mileage *
            <input
                type="number"
                name="mileage"
                value={form.mileage}
                onChange={handleChange}
            />
          </label>

          <label style={{ display: "block", marginTop: "10px" }}>
            Cost *
            <input
                type="number"
                step="0.01"
                name="cost"
                value={form.cost}
                onChange={handleChange}
            />
          </label>

          <label style={{ display: "block", marginTop: "10px" }}>
            Notes
            <textarea name="notes" value={form.notes} onChange={handleChange} rows="4" />
          </label>

          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button type="submit">Save Service Entry</button>
            <button type="button" onClick={() => navigate("/garage")}>
              Cancel
            </button>
          </div>
        </form>

        <div>
          <h3>Service History</h3>
          {entries.length === 0 ? (
              <p>No service entries yet.</p>
          ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {entries.map((entry) => (
                    <div
                        key={entry.id}
                        style={{
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          padding: "16px",
                        }}
                    >
                      <strong>{entry.serviceType.replace(/_/g, " ")}</strong>
                      <p>
                        Date: {entry.serviceDate} | Mileage: {entry.mileage} mi | Cost: ${entry.cost}
                      </p>
                      {entry.notes && <p>Notes: {entry.notes}</p>}
                      <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "8px" }}>
                        Created by: {entry.createdByEmail}
                      </p>

                      {/* Only show Edit and Delete buttons if the current user is the owner */}
                      {isOwner && (
                          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                            <button onClick={() => handleEditClick(entry.id)}>Edit</button>
                            <button onClick={() => handleDeleteClick(entry)}>Delete</button>
                          </div>
                      )}
                    </div>
                ))}
              </div>
          )}
        </div>

        {/* US-8: Delete confirmation modal (reused from US-5) */}
        <DeleteConfirmationModal
            isOpen={entryToDelete !== null}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            itemType="Service Entry"
            vehicleName={
              entryToDelete
                  ? `the ${entryToDelete.serviceType.replace(/_/g, " ")} entry from ${entryToDelete.serviceDate}`
                  : ""
            }
        />
      </div>
  );
}

export default ServiceLog;