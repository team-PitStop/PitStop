import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

function Garage() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        axios
            .get("http://localhost:8080/api/vehicles/grid", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setVehicles(response.data);
                setLoading(false);
            })
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/login");
            });
    }, [navigate]);

    const handleDeleteClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        setModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        const token = localStorage.getItem("token");
        axios
            .delete(`http://localhost:8080/api/vehicles/${selectedVehicle.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                setVehicles((prev) => prev.filter((v) => v.id !== selectedVehicle.id));
                setModalOpen(false);
                setSelectedVehicle(null);
            })
            .catch(() => {
                alert("Could not delete vehicle. Please try again.");
                setModalOpen(false);
            });
    };

    if (loading) return <p>Loading your garage...</p>;

    return (
        <div style={{ padding: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1>My Garage</h1>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={() => navigate("/vehicles/new")}>Add Vehicle</button>
                    <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
                </div>
            </div>

            {vehicles.length === 0 ? (
                <p>No vehicles in your garage yet.</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                    {vehicles.map((v) => (
                        <div
                            key={v.id}
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                padding: "16px",
                            }}
                        >
                            <h3 style={{ margin: "0 0 8px" }}>
                                {v.year} {v.make} {v.model}
                            </h3>
                            <p style={{ margin: "4px 0" }}>Mileage: {v.mileage.toLocaleString()} mi</p>
                            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                <button onClick={() => navigate(`/vehicles/${v.id}/edit`)}>Edit</button>
                                <button onClick={() => navigate(`/vehicles/${v.id}/service-log`)}>Service Log</button>
                                <button onClick={() => navigate(`/vehicles/${v.id}/upcoming`)}>Upcoming</button>
                                <button onClick={() => handleDeleteClick(v)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                vehicleName={selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : ""}
            />
        </div>
    );
}

export default Garage;
