import React, { useState } from 'react';
import './Signup.css';
import axios from 'axios';

function Signup() {
  // State to hold form data
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Password: '',
    Username: '',
    DateOfBirth: '',
    Address: '',
    PhoneNumber: ''
  });

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Send POST request to server
    try {
      const response = await axios.post('http://localhost:4000/api/users/signup', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check for successful response
      if (response.status === 200) {
        console.log('Signup successful');
        alert('Signup successful');
        document.cookie = `Username=${formData.Username}; path=/`;
      } else {
        console.error('Signup failed');
        alert('Signup failed; Make sure you have entered the information correctly');
      }
    } catch (error) {
      alert('Signup failed; Make sure you have entered the information correctly');
      console.error('Error occurred during Signup', error);
    }
  };

  // Function to handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="Signup-Start">
      <div className="signup-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h1 class="signup-header">Signup</h1>
          <input type="text" name="FirstName" value={formData.FirstName} onChange={handleChange} placeholder="First Name" />
          <input type="text" name="LastName" value={formData.LastName} onChange={handleChange} placeholder="Last Name" />
          <input type="text" name="Email" value={formData.Email} onChange={handleChange} placeholder="Email" />
          <input type="password" name="Password" value={formData.Password} onChange={handleChange} placeholder="Password" />
          <input type="text" name="Username" value={formData.Username} onChange={handleChange} placeholder="Username" />
          <input type="date" name="DateOfBirth" value={formData.DateOfBirth} onChange={handleChange} placeholder="Date of Birth" />
          <input type="text" name="Address" value={formData.Address} onChange={handleChange} placeholder="Address" />
          <input type="text" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} placeholder="Phone Number" />
          <button type="submit">Signup</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
