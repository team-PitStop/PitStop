import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PendingInvites() {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const fetchInvites = () => {
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

    const handleAction = async (inviteId, action) => {
        try {
            if (action === 'accept') {
                await axios.post(`http://localhost:8080/api/vehicles/invitations/${inviteId}/accept`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Invitation accepted! Vehicle added to garage.");
            } else {
                await axios.delete(`http://localhost:8080/api/vehicles/invitations/${inviteId}/decline`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Invitation declined.");
            }
            fetchInvites(); // Refresh list after action
        } catch (err) {
            alert("Error processing invitation.");
        }
    };

    if (loading || invites.length === 0) return null;

    return (
        <div style={{ backgroundColor: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#0d47a1' }}>📩 Pending Vehicle Invitations</h3>
            {invites.map(invite => (
                <div key={invite.inviteId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #bbdefb' }}>
                    <p style={{ margin: 0 }}>
                        <strong>{invite.ownerEmail}</strong> invited you to help track their <strong>{invite.vehicleName}</strong>.
                    </p>
                    <div>
                        <button onClick={() => handleAction(invite.inviteId, 'accept')} style={{ marginRight: '8px', backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Accept</button>
                        <button onClick={() => handleAction(invite.inviteId, 'decline')} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Decline</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default PendingInvites;