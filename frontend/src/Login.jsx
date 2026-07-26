import React, { useState } from 'react';
import axios from "./api";
import { useNavigate } from 'react-router-dom';
import AuthScene from './AuthScene';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/login', {
                email,
                password
            });
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="auth-page">
            <AuthScene />
            <div className="card">
                <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>PitStop Login</h1>
                <p style={{ color: 'var(--text-light)', marginTop: 0, marginBottom: '24px' }}>
                    Sign in to track your vehicle maintenance.
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
                        <input type="password" placeholder="Your password" onChange={(e) => setPassword(e.target.value)} required />
                    </label>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>Log In</button>
                </form>
            </div>

            <p className="auth-footnote">
                Don't have an account? <a href="/register">Sign up</a>
            </p>
        </div>
    );
}

export default Login;
