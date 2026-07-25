import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

function ManageCollaboratorsModal({ isOpen, onClose, vehicle }) {
    const [collaborators, setCollaborators] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: "success" | "error", message }
    const [removingId, setRemovingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen || !vehicle) return;
        fetchCollaborators();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, vehicle]);

    if (!isOpen || !vehicle) return null;

    const fetchCollaborators = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            // Not authenticated — force login
            setStatus({ type: 'error', message: 'Session expired. Please sign in again.' });
            navigate('/login');
            return;
        }
        setLoading(true);
        setStatus(null);

        axios
            .get(`http://localhost:8080/api/vehicles/${vehicle.id}/collaborators`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setCollaborators(response.data);
                setLoading(false);
            })
            .catch(() => {
                setStatus({ type: "error", message: "Could not load collaborators." });
                setLoading(false);
            });
    };

    const close = () => {
        setCollaborators([]);
        setStatus(null);
        setRemovingId(null);
        onClose();
    };

    const handleRemove = (userId) => {
        const token = localStorage.getItem("token");
        setRemovingId(userId);
        setStatus(null);

        axios
            .delete(
                `http://localhost:8080/api/vehicles/${vehicle.id}/collaborators/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then(() => {
                setCollaborators((prev) => prev.filter((c) => c.userId !== userId));
                setRemovingId(null);
            })
            .catch((err) => {
                console.error('remove collaborator error', err);
                const statusCode = err.response?.status;
                if (statusCode === 401) {
                    // Authentication problem — clear token and navigate to login
                    localStorage.removeItem('token');
                    setStatus({ type: 'error', message: 'Session expired. Please sign in again.' });
                    setRemovingId(null);
                    navigate('/login');
                    return;
                }
                const message = err.response?.data?.message || "Could not remove access. Please try again.";
                setStatus({ type: "error", message });
                setRemovingId(null);
            });
    };

    const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

    return (
        <div className="modal-overlay" onClick={close}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Manage Access</h3>
                <p>
                    People with access to <strong>{vehicleName}</strong>.
                </p>

                {loading && <p>Loading...</p>}

                {status && (
                    <p style={{ color: status.type === "success" ? "green" : "crimson", marginTop: "8px" }}>
                        {status.message}
                    </p>
                )}

                {!loading && collaborators.length > 0 && (
                    <ul style={{ listStyle: "none", padding: 0, margin: "12px 0" }}>
                        {collaborators.map((c) => (
                            <li
                                key={c.userId}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "8px 0",
                                    borderBottom: "1px solid #eee",
                                }}
                            >
                                <span>
                                    {c.email}{" "}
                                    <span style={{ fontSize: "12px", color: "#555" }}>
                                        ({c.role === "OWNER" ? "Owner" : c.role === "PENDING" ? "Pending" : "Collaborator"})
                                    </span>
                                </span>

                                {c.role !== "OWNER" && (
                                    <button
                                        type="button"
                                        className={c.role === "PENDING" ? "btn-outline" : "btn-danger"}
                                        disabled={removingId === c.userId}
                                        onClick={() => handleRemove(c.userId)}
                                    >
                                        {removingId === c.userId ? (c.role === "PENDING" ? "Cancelling..." : "Removing...") : (c.role === "PENDING" ? "Cancel Invite" : "Remove")}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="modal-buttons" style={{ marginTop: "12px" }}>
                    <button type="button" className="btn-cancel" onClick={close}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ManageCollaboratorsModal;