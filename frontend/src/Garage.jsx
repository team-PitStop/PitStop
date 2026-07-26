import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./api";
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
    const [hasCollaborators, setHasCollaborators] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        axios
            .get("/api/vehicles/grid", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(async (response) => {
                const data = response.data;
                setVehicles(data);

                // For owned vehicles, check whether the owner has shared them with anyone.
                // This controls whether the "Manage Collaborators" button should be shown.
                const token = localStorage.getItem("token");
                const owned = data.filter((veh) => !veh.shared);
                const map = {};
                await Promise.all(
                    owned.map(async (veh) => {
                        try {
                            const res = await axios.get(`/api/vehicles/${veh.id}/collaborators`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            // collaborators list always includes the owner; >1 means someone else was invited/added
                            map[veh.id] = Array.isArray(res.data) && res.data.length > 1;
                        } catch (e) {
                            // If the request fails, assume no collaborators (silently)
                            map[veh.id] = false;
                        }
                    })
                );
                setHasCollaborators(map);
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
            .delete(`/api/vehicles/${selectedVehicle.id}`, {
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

    if (loading) {
        return (
            <div className="card">
                <p style={{ margin: 0, color: "var(--text-light)" }}>Loading your garage...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
                <h1 style={{ margin: 0 }}>My Garage</h1>
                <button className="btn-primary" onClick={() => navigate("/vehicles/new")}>+ Add Vehicle</button>
            </div>

            {vehicles.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
                    <div style={{ fontSize: "40px", lineHeight: 1, marginBottom: "12px" }} aria-hidden>🚗</div>
                    <h3 style={{ marginBottom: "8px" }}>No vehicles yet</h3>
                    <p style={{ color: "var(--text-light)", marginTop: 0, marginBottom: "20px" }}>
                        Add your first vehicle to start logging service and tracking upcoming maintenance.
                    </p>
                    <button className="btn-primary" onClick={() => navigate("/vehicles/new")}>Add Your First Vehicle</button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))", gap: "20px" }}>
                    {vehicles.map((v) => (
                        <div key={v.id} className="card" style={{ display: "flex", flexDirection: "column", marginBottom: 0 }}>
                            <h3 style={{ marginBottom: "8px" }}>{v.year} {v.make} {v.model}</h3>
                            {v.shared && (
                                <span style={{
                                    alignSelf: 'flex-start',
                                    color: 'var(--fiu-gold)',
                                    backgroundColor: 'rgba(182,134,44,0.12)',
                                    border: '1px solid var(--fiu-gold)',
                                    borderRadius: 'var(--border-radius)',
                                    fontWeight: 'bold',
                                    fontSize: '11px',
                                    letterSpacing: '0.5px',
                                    padding: '3px 8px'
                                }}>SHARED ACCESS</span>
                            )}
                            <p style={{ color: 'var(--text-light)', margin: '12px 0 0' }}>Mileage: {v.mileage.toLocaleString()} mi</p>

                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "auto", paddingTop: "16px" }}>
                                <button className="btn-primary" style={{padding: '5px 10px', fontSize: '12px'}} onClick={() => navigate(`/vehicles/${v.id}/service-log`)}>Log</button>
                                <button className="btn-outline" style={{padding: '5px 10px', fontSize: '12px'}} onClick={() => navigate(`/vehicles/${v.id}/upcoming`)}>Upcoming</button>
                                <button className="btn-outline" style={{padding: '5px 10px', fontSize: '12px'}} onClick={() => navigate(`/vehicles/${v.id}/activity`)}>Activity</button>
                                {!v.shared && (
                                    <>
                                        <button className="btn-outline" style={{padding: '5px 10px', fontSize: '12px'}} onClick={() => { setVehicleToShare(v); setShareModalOpen(true); }}>Share</button>
                                        {hasCollaborators[v.id] && (
                                            <button className="btn-outline" style={{padding: '5px 10px', fontSize: '12px'}} onClick={() => { setVehicleToManage(v); setManageModalOpen(true); }}>Manage Collaborators</button>
                                        )}
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
            <ShareVehicleModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} vehicle={vehicleToShare} onShared={(id) => setHasCollaborators((prev) => ({ ...prev, [id]: true }))} />
            <ManageCollaboratorsModal isOpen={manageModalOpen} onClose={() => setManageModalOpen(false)} vehicle={vehicleToManage} />
        </div>
    );
}

export default Garage;