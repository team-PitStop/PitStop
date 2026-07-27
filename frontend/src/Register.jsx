import React, { useState } from 'react';
import axios from "./api";
import { useNavigate } from 'react-router-dom';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/register', {
                email,
                password
            });
            
            // US-1b: Save token to session and redirect
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setMessage(err.response?.data?.error || "Signup failed");
        }
    };

    return (
        <div className="auth-page">
            <div className="card">
                <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>PitStop Sign Up</h1>
                <p style={{ color: 'var(--text-light)', marginTop: 0, marginBottom: '24px' }}>
                    Create an account to start tracking your vehicles.
                </p>

                {message && (
                    <p style={{
                        color: 'var(--error-red)',
                        backgroundColor: '#fff5f5',
                        border: '1px solid var(--error-red)',
                        borderRadius: 'var(--border-radius)',
                        padding: '12px',
                        margin: '0 0 16px'
                    }}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', fontWeight: 600, color: 'var(--fiu-blue)' }}>
                        Email
                        <input type="email" placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} required />
                    </label>

                    <label style={{ display: 'block', fontWeight: 600, color: 'var(--fiu-blue)' }}>
                        Password
                        <input type="password" placeholder="Password (min 8 chars)" onChange={(e) => setPassword(e.target.value)} required />
                    </label>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>Create Account</button>
                </form>
            </div>

            <p className="auth-footnote">
                Already have an account? <a href="/login">Log in</a>
            </p>
        </div>
    );
}

export default Register;