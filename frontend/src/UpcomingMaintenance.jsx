// UpcomingMaintenance.jsx (US-12)
//
// A dedicated per-vehicle page for "what's coming up", reached from the
// "Upcoming" button on each Garage card. Shows the vehicle's upcoming
// maintenance sorted by urgency and color-coded (red = overdue, yellow = due
// soon, neutral = further out), with an empty state when nothing is scheduled.
//
// The "Schedule Upcoming Maintenance" form (originally US-11, from ServiceLog)
// lives here too, so adding and viewing upcoming items share one page.

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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

// red = overdue, yellow = due soon, neutral = further out
const statusStyles = {
  OVERDUE: { backgroundColor: "#ffebee", border: "2px solid #ef5350", label: "Overdue" },
  DUE_SOON: { backgroundColor: "#fff8e1", border: "2px solid #ffca28", label: "Due soon" },
  UPCOMING: { backgroundColor: "#fff", border: "1px solid #ccc", label: "Upcoming" },
};

function UpcomingMaintenance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    serviceType: "OIL_CHANGE",
    dueDate: "",
    dueMileage: "",
    notes: "",
  });

  const loadUpcoming = () => {
    const token = localStorage.getItem("token");
    axios
        .get(`http://localhost:8080/api/vehicles/${id}/upcoming-maintenance`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUpcoming(response.data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          alert("Could not load upcoming maintenance.");
        });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadUpcoming();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    axios
        .post(
            `http://localhost:8080/api/vehicles/${id}/upcoming-maintenance`,
            {
              serviceType: form.serviceType,
              dueDate: form.dueDate || null,
              dueMileage: form.dueMileage ? parseInt(form.dueMileage, 10) : null,
              notes: form.notes,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          setForm({ serviceType: "OIL_CHANGE", dueDate: "", dueMileage: "", notes: "" });
          loadUpcoming(); // refresh so the new item appears, re-sorted
        })
        .catch(() => alert("Could not schedule maintenance."));
  };

  if (loading) return <p style={{ padding: "40px" }}>Loading upcoming maintenance...</p>;

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
          <h2>Upcoming Maintenance</h2>
          <button onClick={() => navigate("/garage")}>Back to Garage</button>
        </div>

        {/* The list, sorted by urgency and color-coded */}
        {upcoming.length === 0 ? (
            <p>No upcoming maintenance scheduled.</p>
        ) : (
            <div style={{ display: "grid", gap: "16px", maxWidth: "640px" }}>
              {upcoming.map((item) => {
                const style = statusStyles[item.status] || statusStyles.UPCOMING;
                return (
                    <div
                        key={item.id}
                        style={{
                          backgroundColor: style.backgroundColor,
                          border: style.border,
                          borderRadius: "8px",
                          padding: "16px",
                        }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>{item.serviceType}</strong>
                        <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>{style.label}</span>
                      </div>
                      <p style={{ margin: "8px 0 0" }}>
                        {item.dueDate && <>Due: {item.dueDate}</>}
                        {item.dueDate && item.dueMileage != null && " | "}
                        {item.dueMileage != null && <>At: {item.dueMileage.toLocaleString()} mi</>}
                        {!item.dueDate && item.dueMileage == null && "No due date or mileage set"}
                      </p>
                      {item.notes && <p style={{ margin: "4px 0 0" }}>Notes: {item.notes}</p>}
                    </div>
                );
              })}
            </div>
        )}

        {/* Schedule Upcoming Maintenance (moved from ServiceLog, originally US-11) */}
        <div style={{ marginTop: "40px" }}>
          <h3>Schedule Upcoming Maintenance</h3>
          <form onSubmit={handleSubmit} style={{ maxWidth: "520px" }}>
            <label>
              Service Type
              <select name="serviceType" value={form.serviceType} onChange={handleChange}>
                {serviceTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", marginTop: "10px" }}>
              Due Date
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
            </label>

            <label style={{ display: "block", marginTop: "10px" }}>
              Due Mileage
              <input type="number" name="dueMileage" value={form.dueMileage} onChange={handleChange} />
            </label>

            <label style={{ display: "block", marginTop: "10px" }}>
              Notes
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" />
            </label>

            <button type="submit" style={{ marginTop: "12px" }}>Schedule Maintenance</button>
          </form>
        </div>
      </div>
  );
}

export default UpcomingMaintenance;
