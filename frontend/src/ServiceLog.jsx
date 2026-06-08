import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
  const [customType, setCustomType] = useState(""); // State for "Other" custom name
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

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

    // US-9 Logic: If OTHER is selected, use the custom text field
    const finalServiceType = form.serviceType === "OTHER" ? customType : form.serviceType;

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
        setForm({ serviceType: "OIL_CHANGE", serviceDate: "", mileage: "", cost: "", notes: "" });
        setCustomType("");
        setErrors({});
      })
      .catch(() => alert("Could not save service entry."));
  };

  if (loading) return <p>Loading service log...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2>Service Log</h2>
        <button onClick={() => navigate("/garage")}>Back to Garage</button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: "32px", maxWidth: "520px" }}>
        <label>
          Service Type *
          <select name="serviceType" value={form.serviceType} onChange={handleChange}>
            {serviceTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </label>

        {/* US-9: Conditional field for custom service name */}
        {form.serviceType === "OTHER" && (
          <label style={{ marginTop: "10px", display: "block" }}>
            Custom Service Name *
            <input 
                type="text" 
                placeholder="Enter service name" 
                value={customType} 
                onChange={(e) => setCustomType(e.target.value)} 
            />
            {errors.customType && <span style={{ color: "red" }}>{errors.customType}</span>}
          </label>
        )}

        <label style={{ display: "block", marginTop: "10px" }}>
          Date *
          <input type="date" name="serviceDate" value={form.serviceDate} onChange={handleChange} />
          {errors.serviceDate && <span style={{ color: "red" }}>{errors.serviceDate}</span>}
        </label>

        <label style={{ display: "block", marginTop: "10px" }}>
          Mileage *
          <input type="number" name="mileage" value={form.mileage} onChange={handleChange} />
        </label>

        <label style={{ display: "block", marginTop: "10px" }}>
          Cost *
          <input type="number" step="0.01" name="cost" value={form.cost} onChange={handleChange} />
        </label>

        <label style={{ display: "block", marginTop: "10px" }}>
          Notes
          <textarea name="notes" value={form.notes} onChange={handleChange} rows="4" />
        </label>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button type="submit">Save Service Entry</button>
          <button type="button" onClick={() => navigate("/garage")}>Cancel</button>
        </div>
      </form>

      <div>
        <h3>Service History</h3>
        {entries.length === 0 ? (
          <p>No service entries yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {entries.map((entry) => (
              <div key={entry.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px" }}>
                <strong>{entry.serviceType.replace(/_/g, " ")}</strong>
                <p>Date: {entry.serviceDate} | Mileage: {entry.mileage} mi | Cost: ${entry.cost}</p>
                {entry.notes && <p>Notes: {entry.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceLog;