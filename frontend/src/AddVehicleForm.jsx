import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
            .post("http://localhost:8080/api/vehicles", {
                ...vehicle,
                year: parseInt(vehicle.year),
                mileage: parseInt(vehicle.mileage),
            }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => navigate("/garage"))
            .catch(() => alert("Could not add vehicle. Please try again."));
    };

    return (
        <div style={{ padding: "40px" }}>
            <h2>Add Vehicle</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Make *
                    <input type="text" name="make" value={vehicle.make} onChange={handleChange} />
                    {errors.make && <span style={{ color: "red" }}>{errors.make}</span>}
                </label>

                <label>
                    Model *
                    <input type="text" name="model" value={vehicle.model} onChange={handleChange} />
                    {errors.model && <span style={{ color: "red" }}>{errors.model}</span>}
                </label>

                <label>
                    Year *
                    <input type="number" name="year" value={vehicle.year} onChange={handleChange} />
                    {errors.year && <span style={{ color: "red" }}>{errors.year}</span>}
                </label>

                <label>
                    Mileage *
                    <input type="number" name="mileage" value={vehicle.mileage} onChange={handleChange} />
                    {errors.mileage && <span style={{ color: "red" }}>{errors.mileage}</span>}
                </label>

                <label>
                    Nickname (optional)
                    <input type="text" name="nickname" value={vehicle.nickname} onChange={handleChange} />
                </label>

                <label>
                    License Plate (optional)
                    <input type="text" name="licensePlate" value={vehicle.licensePlate} onChange={handleChange} />
                </label>

                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => navigate("/garage")}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default AddVehicleForm;
