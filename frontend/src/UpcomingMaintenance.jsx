// UpcomingMaintenance.jsx (UPDATED for US-14)
//
// Changes from Antuan/Daniel's original (US-11, US-12):
//   Added US-14: Maintenance Interval Suggestions
//   When the user selects a service type from the dropdown, the dueDate
//   and dueMileage fields auto-populate with suggested default values.
//   The user can accept the suggestions or override them freely.
//
// Everything else (list view, color coding, form submit) is unchanged.

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
  const [form, setForm] = useState({
    serviceType: "OIL_CHANGE",
    dueDate: "",
    dueMileage: "",
    notes: "",
  });
  const [suggestionApplied, setSuggestionApplied] = useState(false);

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
        setSuggestionApplied(false);
        loadUpcoming();
      })
      .catch(() => alert("Could not schedule maintenance."));
  };

  if (loading) return <p style={{ padding: "40px" }}>Loading upcoming maintenance...</p>;

  const currentInterval = maintenanceIntervals[form.serviceType];

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2>Upcoming Maintenance</h2>
        <button onClick={() => navigate("/garage")}>Back to Garage</button>
      </div>

      {upcoming.length === 0 ? (
        <p>No upcoming maintenance scheduled.</p>
      ) : (
        <div style={{ display: "grid", gap: "16px", maxWidth: "640px" }}>
          {upcoming.map((item) => {
            const style = statusStyles[item.status] || statusStyles.UPCOMING;
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
              </div>
            );
          })}
        </div>
      )}

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

          <button type="submit" style={{ marginTop: "12px" }}>Schedule Maintenance</button>
        </form>
      </div>
    </div>
  );
}

export default UpcomingMaintenance;
