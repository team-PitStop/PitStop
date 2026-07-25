import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function PendingInvites() {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
    const statusTimer = useRef(null);
    const token = localStorage.getItem('token');

    const fetchInvites = () => {
        setStatus(null);
        axios.get('http://localhost:8080/api/vehicles/invitations/pending', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setInvites(res.data);
            setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchInvites();
    }, []);

    // cleanup status timer on unmount
    useEffect(() => {
        return () => { if (statusTimer.current) clearTimeout(statusTimer.current); };
    }, []);

    const clearStatusLater = () => {
        if (statusTimer.current) clearTimeout(statusTimer.current);
        statusTimer.current = setTimeout(() => setStatus(null), 4000);
    };

    const handleAction = async (inviteId, action) => {
        try {
            if (action === 'accept') {
                await axios.post(`http://localhost:8080/api/vehicles/invitations/${inviteId}/accept`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStatus({ type: 'success', message: 'Invitation accepted! Vehicle added to garage.' });
            } else {
                await axios.delete(`http://localhost:8080/api/vehicles/invitations/${inviteId}/decline`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStatus({ type: 'success', message: 'Invitation declined.' });
            }
            fetchInvites(); // Refresh list after action
            clearStatusLater();
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Error processing invitation.' });
            clearStatusLater();
        }
    };

    if (loading) return null;

    if (invites.length === 0 && !status) return null;

    return (
        <div className="card">
            <h3>📩 Pending Vehicle Invitations</h3>

            {status && (
                <p style={{ color: status.type === 'success' ? 'green' : 'crimson', marginTop: '8px' }}>
                    {status.message}
                </p>
            )}

            {invites.map(invite => (
                <div key={invite.inviteId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                    <p style={{ margin: 0, color: 'var(--text-light)' }}>
                        <strong style={{ color: 'var(--text-dark)' }}>{invite.ownerEmail}</strong> invited you to help track their <strong style={{ color: 'var(--text-dark)' }}>{invite.vehicleName}</strong>.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" onClick={() => handleAction(invite.inviteId, 'accept')}>Accept</button>
                        <button className="btn-danger" onClick={() => handleAction(invite.inviteId, 'decline')}>Decline</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default PendingInvites;