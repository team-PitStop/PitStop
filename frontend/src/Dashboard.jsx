import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PendingInvites from './PendingInvites'; // US-20: Import component

function Dashboard() {
    const [email, setEmail] = useState('');
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Fetch User Info
        axios.get('http://localhost:8080/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setEmail(response.data.email))
        .catch(() => {
            localStorage.removeItem('token');
            navigate('/login');
        });

        // US-15: Fetch Overdue Alerts
        axios.get('http://localhost:8080/api/alerts/overdue', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setAlerts(response.data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Could not fetch alerts", err);
            setLoading(false);
        });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return <p style={{ padding: '40px' }}>Loading PitStop...</p>;

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
            
            {/* US-20: Acceptance Criteria - Visible Pending Invites */}
            <PendingInvites />

            {/* US-15: Acceptance Criteria - Dashboard Banner */}
            {alerts.length > 0 && (
                <div style={{
                    backgroundColor: '#ffebee',
                    border: '2px solid #ef5350',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '30px',
                    color: '#c62828'
                }}>
                    <h2 style={{ margin: '0 0 10px 0' }}>⚠️ Overdue Maintenance ({alerts.length})</h2>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {alerts.map((alert, index) => (
                            <li 
                                key={index} 
                                onClick={() => navigate(`/vehicles/${alert.vehicleId}/service-log`)}
                                style={{ 
                                    cursor: 'pointer', 
                                    padding: '10px', 
                                    borderBottom: '1px solid #ffcdd2',
                                    textDecoration: 'underline'
                                }}
                            >
                                <strong>{alert.vehicleName}</strong>: {alert.serviceType} is past due by {alert.reason.toLowerCase()}!
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <h1>Welcome to PitStop</h1>
            {email && <p>Logged in as: <strong>{email}</strong></p>}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => navigate('/garage')} style={{ padding: '10px 20px', cursor: 'pointer' }}>My Garage</button>
                <button onClick={handleLogout} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#f5f5f5' }}>Log Out</button>
            </div>
        </div>
    );
}

export default Dashboard;