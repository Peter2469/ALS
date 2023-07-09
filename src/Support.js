import React, { useState, useEffect } from 'react';
import './Support.css';
import axios from 'axios';

function Support() {
  const [formData, setFormData] = useState({
    Username: '',
    Email: '',
    Description: ''
  });

  // Check for username cookie on component mount
  useEffect(() => {
    const name = document.cookie.replace(/(?:(?:^|.*;\s*)Username\s*=\s*([^;]*).*$)|^.*$/, "$1");
    if (name) {
      setFormData(prevFormData => ({
        ...prevFormData,
        Username: name
      }));
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Perform the POST request to /api/support/add with the form data
    try {
      await axios.post('http://192.168.1.135:4000/api/support/add', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Reset form data
      setFormData({
        Username: '',
        Email: '',
        Description: ''
      });

      alert('Form submission successful!'); // Show alert for successful submission
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  return (
    <div className="Support-Start">
      <div className="support-container">
        <form className="support-form" onSubmit={handleSubmit}>
          <h1 className="Support-Title">Support Form</h1>
          <input type="text" name="Username" placeholder="Username" value={formData.Username} onChange={handleChange}/>
          <input type="email" name="Email" placeholder="Email" value={formData.Email} onChange={handleChange}/>
          <input type="text" name="Description" placeholder="Description" value={formData.Description} onChange={handleChange} />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default Support;