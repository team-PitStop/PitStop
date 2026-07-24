// UpcomingMaintenance.jsx
//
// A dedicated per-vehicle page for "what's coming up", reached from the
// "Upcoming" button on each Garage card. Shows the vehicle's upcoming
// maintenance sorted by urgency and color-coded (red = overdue, yellow = due
// soon, neutral = further out), with an empty state when nothing is scheduled.
//
// Features combined on this page:
//   US-11/US-12: schedule + view upcoming maintenance.
//   US-13: mark a scheduled item as done (records actual date/mileage/cost and
//          moves it into the vehicle's history).
//   US-14: maintenance interval suggestions — picking a service type auto-fills
//          suggested dueDate / dueMileage, which the user can override.

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

const maintenanceIntervals = {
  OIL_CHANGE:    { mileageInterval: 5000,  monthInterval: 3  },
  TIRE_ROTATION: { mileageInterval: 7500,  monthInterval: 6  },
  BRAKE_SERVICE: { mileageInterval: 20000, monthInterval: 24 },
  BATTERY:       { mileageInterval: 50000, monthInterval: 48 },
  AIR_FILTER:    { mileageInterval: 15000, monthInterval: 12 },
  TRANSMISSION:  { mileageInterval: 30000, monthInterval: 24 },
  COOLANT:       { mileageInterval: 30000, monthInterval: 24 },
  INSPECTION:    { mileageInterval: null,  monthInterval: 12 },
  OTHER:         { mileageInterval: null,  monthInterval: null },
};

function getSuggestedDate(monthsFromNow) {
  if (!monthsFromNow) return "";
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date.toISOString().split("T")[0];
}

// red = overdue, yellow = due soon, neutral = further out
const statusStyles = {
  OVERDUE:  { backgroundColor: "#ffebee", border: "2px solid #ef5350", label: "Overdue"  },
  DUE_SOON: { backgroundColor: "#fff8e1", border: "2px solid #ffca28", label: "Due soon" },
  UPCOMING: { backgroundColor: "#fff",    border: "1px solid #ccc",    label: "Upcoming" },
};

function UpcomingMaintenance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [form, setForm] = useState({
    serviceType: "OIL_CHANGE",
    dueDate: "",
    dueMileage: "",
    notes: "",
  });
  const [suggestionApplied, setSuggestionApplied] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [completeForm, setCompleteForm] = useState({
    actualDate: "",
    actualMileage: "",
    actualCost: "",
  });
  const [completeErrors, setCompleteErrors] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [formError, setFormError] = useState(null);

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
          setLoadError("Could not load upcoming maintenance. Please try refreshing the page.");
        });
  };

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

    loadUpcoming();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "serviceType") {
      const interval = maintenanceIntervals[value];
      const shouldSuggest = !form.dueDate || !form.dueMileage || suggestionApplied;

      if (interval && shouldSuggest) {
        setForm({
          ...form,
          serviceType: value,
          dueDate: interval.monthInterval
            ? getSuggestedDate(interval.monthInterval)
            : form.dueDate,
          dueMileage: interval.mileageInterval
            ? String(interval.mileageInterval)
            : form.dueMileage,
        });
        setSuggestionApplied(true);
      } else {
        setForm({ ...form, serviceType: value });
        setSuggestionApplied(false);
      }
    } else {
      if (name === "dueDate" || name === "dueMileage") {
        setSuggestionApplied(false);
      }
      setForm({ ...form, [name]: value });
    }
  };

  const handleCompleteChange = (e) => {
    const { name, value } = e.target;
    setCompleteForm({ ...completeForm, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
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
        setSuggestionApplied(false);
        loadUpcoming(); // refresh so the new item appears, re-sorted
      })
        .catch((error) => {
          if (error.response?.status === 401) {
            setFormError("Session expired. Please log in again.");
            navigate("/login");
            return;
          }
          setFormError("Could not schedule maintenance. Please try again.");
        });
  };

  const handleCompleteClick = (item) => {
    setCompletingId(item.id);
    setCompleteForm({ actualDate: "", actualMileage: "", actualCost: "" });
    setCompleteErrors({});
  };

  const handleCancelComplete = () => {
    setCompletingId(null);
    setCompleteErrors({});
  };

  const handleCompleteSubmit = (itemId) => {
    const errors = {};
    if (!completeForm.actualDate) errors.actualDate = "Actual date is required.";
    if (completeForm.actualMileage === "") errors.actualMileage = "Actual mileage is required.";
    if (completeForm.actualCost === "") errors.actualCost = "Actual cost is required.";
    setCompleteErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please log in again.");
      navigate("/login");
      return;
    }
    axios
      .post(
        `http://localhost:8080/api/vehicles/${id}/upcoming-maintenance/${itemId}/complete`,
        {
          actualDate: completeForm.actualDate,
          actualMileage: parseInt(completeForm.actualMileage, 10),
          actualCost: parseFloat(completeForm.actualCost),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setCompletingId(null);
        setCompleteForm({ actualDate: "", actualMileage: "", actualCost: "" });
        loadUpcoming();
      })
        .catch((error) => {
          if (error.response?.status === 401) {
            setFormError("Session expired. Please log in again.");
            navigate("/login");
            return;
          }
          const message = error.response?.data?.message || error.message || "Could not mark maintenance as done.";
          setCompleteErrors({ submit: message });
        });
  };

  if (loading) return <div className="card"><p>Loading upcoming maintenance...</p></div>;

  const currentInterval = maintenanceIntervals[form.serviceType];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2>Upcoming Maintenance</h2>
        <button className="btn-outline" onClick={() => navigate("/garage")}>Back to Garage</button>
      </div>

      {loadError && (
          <div className="card" style={{ borderTopColor: "var(--error-red)", backgroundColor: "#fff5f5" }}>
            <p style={{ color: "var(--error-red)", margin: 0 }}>{loadError}</p>
          </div>
      )}

      {formError && (
          <div className="card" style={{ borderTopColor: "var(--error-red)", backgroundColor: "#fff5f5" }}>
            <p style={{ color: "var(--error-red)", margin: 0 }}>{formError}</p>
          </div>
      )}

      {/* The list, sorted by urgency and color-coded */}
      {upcoming.length === 0 ? (
          <div className="card"><p>No upcoming maintenance scheduled.</p></div>
      ) : (
        <div style={{ display: "grid", gap: "16px", maxWidth: "640px" }}>
          {upcoming.map((item) => {
            const style = statusStyles[item.status] || statusStyles.UPCOMING;
            const isCompleting = completingId === item.id;
            return (
              <div key={item.id} style={{ backgroundColor: style.backgroundColor, border: style.border, borderRadius: "8px", padding: "16px" }}>
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

                {isOwner && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button type="button" className="btn-outline" onClick={() => handleCompleteClick(item)}>
                      Mark as Done
                    </button>
                  </div>
                )}

                {isCompleting && (
                  <div style={{ marginTop: "16px", padding: "16px", border: "1px solid #ddd", borderRadius: "8px", background: "#fafafa" }}>
                    <h4 style={{ marginTop: 0 }}>Complete Maintenance</h4>
                    <p style={{ marginTop: 0, marginBottom: "12px" }}>
                      Enter the actual date, mileage, and cost to save this maintenance in history.
                    </p>
                    <label style={{ display: "block", marginBottom: "8px" }}>
                      Actual Date *
                      <input
                        type="date"
                        name="actualDate"
                        value={completeForm.actualDate}
                        onChange={handleCompleteChange}
                      />
                      {completeErrors.actualDate && (
                        <span style={{ color: "var(--error-red)", display: "block" }}>{completeErrors.actualDate}</span>
                      )}
                    </label>
                    <label style={{ display: "block", marginBottom: "8px" }}>
                      Actual Mileage *
                      <input
                        type="number"
                        name="actualMileage"
                        value={completeForm.actualMileage}
                        onChange={handleCompleteChange}
                      />
                      {completeErrors.actualMileage && (
                        <span style={{ color: "var(--error-red)", display: "block" }}>{completeErrors.actualMileage}</span>
                      )}
                    </label>
                    <label style={{ display: "block", marginBottom: "8px" }}>
                      Actual Cost *
                      <input
                        type="number"
                        step="0.01"
                        name="actualCost"
                        value={completeForm.actualCost}
                        onChange={handleCompleteChange}
                      />
                      {completeErrors.actualCost && (
                        <span style={{ color: "var(--error-red)", display: "block" }}>{completeErrors.actualCost}</span>
                      )}
                    </label>
                    {completeErrors.submit && (
                        <p style={{ color: "var(--error-red)", marginBottom: "8px" }}>{completeErrors.submit}</p>
                    )}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" className="btn-primary" onClick={() => handleCompleteSubmit(item.id)}>
                        Save to History
                      </button>
                      <button type="button" className="btn-outline" onClick={handleCancelComplete}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Upcoming Maintenance (moved from ServiceLog, originally US-11) */}
      {isOwner ? (
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

            {currentInterval && (currentInterval.mileageInterval || currentInterval.monthInterval) && (
              <p style={{ margin: "4px 0 8px", fontSize: "0.85rem", color: "#666" }}>
                💡 Suggested interval:
                {currentInterval.mileageInterval && ` every ${currentInterval.mileageInterval.toLocaleString()} miles`}
                {currentInterval.mileageInterval && currentInterval.monthInterval && " or"}
                {currentInterval.monthInterval && ` every ${currentInterval.monthInterval} months`}
                {suggestionApplied && " (applied below — you can override)"}
              </p>
            )}

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

            <button type="submit" className="btn-primary" style={{ marginTop: "12px" }}>Schedule Maintenance</button>
          </form>
        </div>
      ) : (
        <div style={{ marginTop: "40px", padding: "16px", backgroundColor: "#e3f2fd", borderRadius: "8px", border: "1px solid #90caf9" }}>
          <p style={{ margin: 0, color: "#1565c0" }}>
            Only the vehicle owner can schedule maintenance. You can view upcoming maintenance for this shared vehicle.
          </p>
        </div>
      )}
    </div>
  );
}

export default UpcomingMaintenance;