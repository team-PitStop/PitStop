import React, { useState } from 'react';
import axios from 'axios';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/register', {
                email,
                password
            });
            setMessage(response.data.message);
            // After success, you could use 'useNavigate' to go to /dashboard
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