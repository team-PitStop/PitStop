import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/auth/register', {
                email,
                password
            });
            navigate('/login');
        } catch (err) {
            setMessage(err.response?.data?.error || "Signup failed");
        }
    };

    return (
        <div style={{ padding: '40px' }}>
            <h1>PitStop Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required /><br/><br/>
                <input type="password" placeholder="Password (min 8 chars)" onChange={(e) => setPassword(e.target.value)} required /><br/><br/>
                <button type="submit">Create Account</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default Register;