// EditVehicleForm.jsx
// US-5: Edit a Vehicle
// This component:
//   1. Loads the existing vehicle data from the backend when the page opens
//   2. Pre-fills the form fields with that data
//   3. Validates required fields (make, model, year, mileage)
//   4. Sends a PUT request to update the vehicle when the user clicks Save

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditVehicleForm() {
  // useParams grabs the vehicle ID from the URL (e.g., /vehicles/3/edit -> id = "3")
  const { id } = useParams();

  // useNavigate lets us redirect the user after a successful save
  const navigate = useNavigate();

  // State for each form field. We start with empty strings, then fill them in
  // once the backend gives us the vehicle's current data.
  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    nickname: "",
    licensePlate: "",
  });

  // State for validation errors and loading status
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // useEffect runs once when the page loads.
  // It fetches the vehicle's current data so we can pre-fill the form.
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/vehicles/${id}`)
      .then((response) => {
        setVehicle(response.data); // pre-fill the form with the data
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading vehicle:", error);
        setLoading(false);
      });
  }, [id]);

  // This runs every time the user types in a field.
  // It updates the matching field in our vehicle state.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle({ ...vehicle, [name]: value });
  };

  // Validates that required fields are filled in.
  // Returns true if everything is valid, false if there are errors.
  const validate = () => {
    const newErrors = {};
    if (!vehicle.make || !vehicle.make.toString().trim())
      newErrors.make = "Make is required";
    if (!vehicle.model || !vehicle.model.toString().trim())
      newErrors.model = "Model is required";
    if (!vehicle.year) newErrors.year = "Year is required";
    if (!vehicle.mileage && vehicle.mileage !== 0)
      newErrors.mileage = "Mileage is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Runs when the user clicks the Save button.
  // Sends the updated data to the backend, then redirects to the garage.
  const handleSubmit = (e) => {
    e.preventDefault(); // stops the page from reloading

    if (!validate()) return; // stop if validation failed

    axios
      .put(`http://localhost:8080/api/vehicles/${id}`, vehicle)
      .then(() => {
        navigate("/garage"); // redirect to garage view on success
      })
      .catch((error) => {
        console.error("Error saving vehicle:", error);
        alert("Could not save changes. Please try again.");
      });
  };

  // Show a loading message while we fetch the vehicle data
  if (loading) return <p>Loading vehicle...</p>;

  return (
    <div className="edit-vehicle-form">
      <h2>Edit Vehicle</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Make *
          <input
            type="text"
            name="make"
            value={vehicle.make || ""}
            onChange={handleChange}
          />
          {errors.make && <span className="error">{errors.make}</span>}
        </label>

        <label>
          Model *
          <input
            type="text"
            name="model"
            value={vehicle.model || ""}
            onChange={handleChange}
          />
          {errors.model && <span className="error">{errors.model}</span>}
        </label>

        <label>
          Year *
          <input
            type="number"
            name="year"
            value={vehicle.year || ""}
            onChange={handleChange}
          />
          {errors.year && <span className="error">{errors.year}</span>}
        </label>

        <label>
          Mileage *
          <input
            type="number"
            name="mileage"
            value={vehicle.mileage || ""}
            onChange={handleChange}
          />
          {errors.mileage && <span className="error">{errors.mileage}</span>}
        </label>

        <label>
          Nickname (optional)
          <input
            type="text"
            name="nickname"
            value={vehicle.nickname || ""}
            onChange={handleChange}
          />
        </label>

        <label>
          License Plate (optional)
          <input
            type="text"
            name="licensePlate"
            value={vehicle.licensePlate || ""}
            onChange={handleChange}
          />
        </label>

        <div className="form-buttons">
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => navigate("/garage")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditVehicleForm;