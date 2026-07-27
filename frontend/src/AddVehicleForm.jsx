import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./api";

function AddVehicleForm() {
    const [vehicle, setVehicle] = useState({
        make: "",
        model: "",
        year: "",
        mileage: "",
        nickname: "",
        licensePlate: "",
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVehicle({ ...vehicle, [name]: value });
    };

    const validate = () => {
        const newErrors = {};
        if (!vehicle.make.trim()) newErrors.make = "Make is required";
        if (!vehicle.model.trim()) newErrors.model = "Model is required";
        if (!vehicle.year) newErrors.year = "Year is required";
        if (vehicle.mileage === "") newErrors.mileage = "Mileage is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const token = localStorage.getItem("token");
        axios
            .post("/api/vehicles", {
                ...vehicle,
                year: parseInt(vehicle.year),
                mileage: parseInt(vehicle.mileage),
            }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => navigate("/garage"))
            .catch(() => alert("Could not add vehicle. Please try again."));
    };

    const labelStyle = { display: "block", fontWeight: 600, color: "var(--fiu-blue)" };
    const errorStyle = { display: "block", color: "var(--error-red)", fontSize: "0.85rem", marginTop: "-10px", marginBottom: "12px" };

    return (
        <div style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
                <h2 style={{ margin: 0 }}>Add Vehicle</h2>
                <button className="btn-outline" onClick={() => navigate("/garage")}>Back to Garage</button>
            </div>

            <form onSubmit={handleSubmit} className="card">
                <label style={labelStyle}>
                    Make *
                    <input type="text" name="make" value={vehicle.make} onChange={handleChange} />
                </label>
                {errors.make && <span style={errorStyle}>{errors.make}</span>}

                <label style={labelStyle}>
                    Model *
                    <input type="text" name="model" value={vehicle.model} onChange={handleChange} />
                </label>
                {errors.model && <span style={errorStyle}>{errors.model}</span>}

                <label style={labelStyle}>
                    Year *
                    <input type="number" name="year" value={vehicle.year} onChange={handleChange} />
                </label>
                {errors.year && <span style={errorStyle}>{errors.year}</span>}

                <label style={labelStyle}>
                    Mileage *
                    <input type="number" name="mileage" value={vehicle.mileage} onChange={handleChange} />
                </label>
                {errors.mileage && <span style={errorStyle}>{errors.mileage}</span>}

                <label style={labelStyle}>
                    Nickname (optional)
                    <input type="text" name="nickname" value={vehicle.nickname} onChange={handleChange} />
                </label>

                <label style={labelStyle}>
                    License Plate (optional)
                    <input type="text" name="licensePlate" value={vehicle.licensePlate} onChange={handleChange} />
                </label>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
                    <button type="submit" className="btn-primary">Save</button>
                    <button type="button" className="btn-outline" onClick={() => navigate("/garage")}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default AddVehicleForm;
