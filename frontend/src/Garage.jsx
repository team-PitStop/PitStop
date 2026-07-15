import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ShareVehicleModal from "./ShareVehicleModal";
import ManageCollaboratorsModal from "./ManageCollaboratorsModal";

function Garage() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [vehicleToShare, setVehicleToShare] = useState(null);
    const [manageModalOpen, setManageModalOpen] = useState(false);
    const [vehicleToManage, setVehicleToManage] = useState(null);
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
                alert("Could not delete vehicle.");
                setModalOpen(false);
            });
    };

    if (loading) return <p>Loading your garage...</p>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1>My Garage</h1>
                <button className="btn-primary" onClick={() => navigate("/vehicles/new")}>+ Add Vehicle</button>
            </div>

            {vehicles.length === 0 ? (
                <div className="card"><p>No vehicles in your garage yet.</p></div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                    {vehicles.map((v) => (
                        <div key={v.id} className="card">
                            <h3 style={{ marginBottom: "5px" }}>{v.year} {v.make} {v.model}</h3>
                            {v.shared && <span style={{color: 'var(--fiu-gold)', fontWeight: 'bold', fontSize: '12px'}}>SHARED ACCESS</span>}
                            <p style={{ color: 'var(--text-light)', margin: '10px 0' }}>Mileage: {v.mileage.toLocaleString()} mi</p>
                            
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "15px" }}>
                                <button className="btn-primary" style={{padding: '5px 10px', fontSize: '12px'}} onClick={() => navigate(`/vehicles/${v.id}/service-log`)}>Log</button>
                                <button className="btn-outline" style={{padding: '5px 10px', fontSize: '12px'}} onClick={() => navigate(`/vehicles/${v.id}/upcoming`)}>Upcoming</button>
                                <button className="btn-outline" style={{padding: '5px 10px', fontSize: '12px'}} onClick={() => navigate(`/vehicles/${v.id}/activity`)}>Activity</button>
                                {!v.shared && (
                                    <>
                                        <button className="btn-outline" style={{padding: '5px 10px', fontSize: '12px'}} onClick={() => navigate(`/vehicles/${v.id}/edit`)}>Edit</button>
                                        <button className="btn-danger" style={{padding: '5px 10px', fontSize: '12px'}} onClick={() => handleDeleteClick(v)}>Delete</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DeleteConfirmationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleDeleteConfirm} vehicleName={selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : ""} />
            <ShareVehicleModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} vehicle={vehicleToShare} />
            <ManageCollaboratorsModal isOpen={manageModalOpen} onClose={() => setManageModalOpen(false)} vehicle={vehicleToManage} />
        </div>
    );
}

export default Garage;