import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PendingInvites from './PendingInvites';

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

        axios.get('http://localhost:8080/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setEmail(response.data.email))
        .catch(() => {
            localStorage.removeItem('token');
            navigate('/login');
        });

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

    if (loading) return <p>Loading Dashboard...</p>;

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome back, <strong>{email}</strong></p>

            <PendingInvites />

            {alerts.length > 0 && (
                <div className="card" style={{ borderTopColor: 'var(--error-red)', backgroundColor: '#fff5f5' }}>
                    <h2 style={{ color: 'var(--error-red)' }}>⚠️ Overdue Maintenance</h2>
                    <ul style={{ paddingLeft: '20px' }}>
                        {alerts.map((alert, index) => (
                            <li key={index} 
                                onClick={() => navigate(`/vehicles/${alert.vehicleId}/service-log`)}
                                style={{ cursor: 'pointer', marginBottom: '8px', color: '#b71c1c', textDecoration: 'underline' }}>
                                {alert.vehicleName}: {alert.serviceType} is past due!
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="card">
                <h2>Quick Actions</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="btn-primary" onClick={() => navigate('/garage')}>Open My Garage</button>
                    <button className="btn-outline" onClick={() => navigate('/vehicles/new')}>Add New Vehicle</button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;