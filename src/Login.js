import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';

function Login() {
  // State to hold form data
  const [formData, setFormData] = useState({
    Username: '',
    Password: ''
  });

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Send POST request to server
    try {
      const response = await axios.post('http://localhost:4000/api/users/login', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check for successful response
      if (response.status === 200) {
        console.log('Login successful');
        alert('Login successful');
        const { staff } = response.data;
        document.cookie = `Username=${formData.Username}; path=/`;
        document.cookie = `Staff=${staff}; path=/`;

        if (staff === 1) {
          window.location.href = '/staffdashboard';
        } else {
          window.location.href = '/';
        }
      } else {
        // Handle failed login
        console.error('Login failed');
        alert('Login failed; Make sure you have entered the correct username and password');
      }
    } catch (error) {
      alert('Login failed; Make sure you have entered the correct username and password');
      console.error('Error occurred during login', error);
    }
  };
  
  // Function to handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="Login-Start">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 class="login-header">Login</h1>
          <input type="text" name="Username" value={formData.Username} onChange={handleChange} placeholder="Username" />
          <input type="password" name="Password" value={formData.Password} onChange={handleChange} placeholder="Password" />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
