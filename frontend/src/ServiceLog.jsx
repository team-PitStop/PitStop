import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const serviceTypes = [
  { value: "OIL_CHANGE", label: "Oil Change" },
  { value: "TIRE_ROTATION", label: "Tire Rotation" },
  { value: "BRAKES", label: "Brakes" },
  { value: "BATTERY", label: "Battery" },
  { value: "OTHER", label: "Other" },
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
        alert("Could not load service entries for this vehicle.");
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.serviceDate) newErrors.serviceDate = "Date is required";
    if (!form.mileage) {
      newErrors.mileage = "Mileage is required";
    } else if (isNaN(form.mileage) || Number(form.mileage) < 0) {
      newErrors.mileage = "Mileage must be a non-negative number";
    }
    if (!form.cost) {
      newErrors.cost = "Cost is required";
    } else if (isNaN(form.cost) || Number(form.cost) < 0) {
      newErrors.cost = "Cost must be a non-negative number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem("token");
    axios
      .post(
        `http://localhost:8080/api/vehicles/${id}/service-entries`,
        {
          serviceType: form.serviceType,
          serviceDate: form.serviceDate,
          mileage: parseInt(form.mileage, 10),
          cost: parseFloat(form.cost),
          notes: form.notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
        setErrors({});
      })
      .catch(() => {
        alert("Could not save service entry. Please try again.");
      });
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
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date *
          <input type="date" name="serviceDate" value={form.serviceDate} onChange={handleChange} />
          {errors.serviceDate && <span style={{ color: "red" }}>{errors.serviceDate}</span>}
        </label>

        <label>
          Mileage *
          <input type="number" min="0" name="mileage" value={form.mileage} onChange={handleChange} />
          {errors.mileage && <span style={{ color: "red" }}>{errors.mileage}</span>}
        </label>

        <label>
          Cost *
          <input type="number" step="0.01" min="0" name="cost" value={form.cost} onChange={handleChange} />
          {errors.cost && <span style={{ color: "red" }}>{errors.cost}</span>}
        </label>

        <label>
          Notes
          <textarea name="notes" value={form.notes} onChange={handleChange} rows="4" />
        </label>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button type="submit">Save Service Entry</button>
          <button type="button" onClick={() => navigate("/garage")}>Cancel</button>
        </div>
      </form>

      <div>
        {entries.length === 0 ? (
          <p>No service entries yet for this vehicle.</p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {entries.map((entry) => (
              <div key={entry.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px" }}>
                <strong>{serviceTypes.find((type) => type.value === entry.serviceType)?.label || entry.serviceType}</strong>
                <p style={{ margin: "8px 0 0" }}>
                  <strong>Date:</strong> {entry.serviceDate}
                </p>
                <p style={{ margin: "4px 0" }}><strong>Mileage:</strong> {entry.mileage.toLocaleString()} mi</p>
                <p style={{ margin: "4px 0" }}><strong>Cost:</strong> ${entry.cost.toFixed(2)}</p>
                {entry.notes && <p style={{ margin: "4px 0" }}><strong>Notes:</strong> {entry.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceLog;
