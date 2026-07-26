import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "./api";

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
            .get(`/api/vehicles/${vehicle.id}/collaborators`, {
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
                `/api/vehicles/${vehicle.id}/collaborators/${userId}`,
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
            <div className="modal-content" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
                <h3>Manage Access</h3>
                <p style={{ color: "var(--text-light)" }}>
                    People with access to <strong style={{ color: "var(--text-dark)" }}>{vehicleName}</strong>.
                </p>

                {loading && <p style={{ color: "var(--text-light)" }}>Loading collaborators...</p>}

                {status && (
                    <p style={{
                        color: status.type === "success" ? "#2e7d32" : "var(--error-red)",
                        backgroundColor: status.type === "success" ? "#f1f8f2" : "#fff5f5",
                        border: `1px solid ${status.type === "success" ? "#2e7d32" : "var(--error-red)"}`,
                        borderRadius: "var(--border-radius)",
                        padding: "12px",
                        margin: "0 0 8px"
                    }}>
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
                                    gap: "12px",
                                    flexWrap: "wrap",
                                    padding: "12px 0",
                                    borderBottom: "1px solid #eee",
                                }}
                            >
                                <span>
                                    {c.email}{" "}
                                    <span style={{ fontSize: "12px", color: "var(--text-light)" }}>
                                        ({c.role === "OWNER" ? "Owner" : c.role === "PENDING" ? "Pending" : "Collaborator"})
                                    </span>
                                </span>

                                {c.role !== "OWNER" && (
                                    <button
                                        type="button"
                                        className={c.role === "PENDING" ? "btn-outline" : "btn-danger"}
                                        style={{ padding: "5px 10px", fontSize: "12px" }}
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
                    <button type="button" className="btn-outline" onClick={close}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ManageCollaboratorsModal;