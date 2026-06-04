import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
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
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (error) return <p>{error}</p>;

    return (
        <div style={{ padding: '40px' }}>
            <h1>Welcome to PitStop</h1>
            {email && <p>Logged in as: {email}</p>}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => navigate('/garage')}>My Garage</button>
                <button onClick={handleLogout}>Log Out</button>
            </div>
        </div>
    );
}

export default Dashboard;
