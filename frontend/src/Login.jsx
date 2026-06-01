import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
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
        <div style={{ padding: '40px' }}>
            <h1>PitStop Login</h1>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required /><br /><br />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required /><br /><br />
                <button type="submit">Log In</button>
            </form>
            <p>{message}</p>
            <p>Don't have an account? <a href="/register">Sign up</a></p>
        </div>
    );
}

export default Login;
