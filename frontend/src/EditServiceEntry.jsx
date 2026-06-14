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

function EditServiceEntry() {
  const { vehicleId, id } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState({
    serviceType: "OIL_CHANGE",
    serviceDate: "",
    mileage: "",
    cost: "",
    notes: "",
  });

  const [customType, setCustomType] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(
        `http://localhost:8080/api/vehicles/${vehicleId}/service-entries/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        const data = response.data;
        const isStandard = serviceTypes.some(
          (type) => type.value === data.serviceType && type.value !== "OTHER"
        );

        if (isStandard) {
          setEntry({
            serviceType: data.serviceType,
            serviceDate: data.serviceDate || "",
            mileage: data.mileage || "",
            cost: data.cost || "",
            notes: data.notes || "",
          });
        } else {
          setCustomType(data.serviceType);
          setEntry({
            serviceType: "OTHER",
            serviceDate: data.serviceDate || "",
            mileage: data.mileage || "",
            cost: data.cost || "",
            notes: data.notes || "",
          });
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading service entry:", error);
        setLoading(false);
        alert("Could not load service entry.");
      });
  }, [vehicleId, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntry({ ...entry, [name]: value });
    if (name === "serviceType" && value !== "OTHER") {
      setCustomType("");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!entry.serviceDate) newErrors.serviceDate = "Date is required";
    if (!entry.mileage && entry.mileage !== 0) newErrors.mileage = "Mileage is required";
    if (!entry.cost && entry.cost !== 0) newErrors.cost = "Cost is required";
    if (entry.serviceType === "OTHER" && !customType.trim()) {
      newErrors.customType = "Please specify the service name";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalServiceType = entry.serviceType === "OTHER" ? customType : entry.serviceType;
    const token = localStorage.getItem("token");

    axios
      .put(
        `http://localhost:8080/api/vehicles/${vehicleId}/service-entries/${id}`,
        {
          serviceType: finalServiceType,
          serviceDate: entry.serviceDate,
          mileage: parseInt(entry.mileage, 10),
          cost: parseFloat(entry.cost),
          notes: entry.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        navigate(`/vehicles/${vehicleId}/service-log`);
      })
      .catch((error) => {
        console.error("Error saving service entry:", error);
        alert("Could not save changes. Please try again.");
      });
  };

  if (loading) return <p>Loading service entry...</p>;

  return (
    <div style={{ padding: "40px", maxWidth: "520px" }}>
      <h2>Edit Service Entry</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Service Type *
          <select name="serviceType" value={entry.serviceType} onChange={handleChange}>
            {serviceTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </label>

        {entry.serviceType === "OTHER" && (
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
          <input type="date" name="serviceDate" value={entry.serviceDate} onChange={handleChange} />
          {errors.serviceDate && <span style={{ color: "red" }}>{errors.serviceDate}</span>}
        </label>

        <label style={{ display: "block", marginTop: "10px" }}>
          Mileage *
          <input type="number" name="mileage" value={entry.mileage} onChange={handleChange} />
          {errors.mileage && <span style={{ color: "red" }}>{errors.mileage}</span>}
        </label>

        <label style={{ display: "block", marginTop: "10px" }}>
          Cost *
          <input type="number" step="0.01" name="cost" value={entry.cost} onChange={handleChange} />
          {errors.cost && <span style={{ color: "red" }}>{errors.cost}</span>}
        </label>

        <label style={{ display: "block", marginTop: "10px" }}>
          Notes
          <textarea name="notes" value={entry.notes || ""} onChange={handleChange} rows="4" />
        </label>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => navigate(`/vehicles/${vehicleId}/service-log`)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditServiceEntry;
