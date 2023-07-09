import React, { useState, useEffect } from 'react';
import './Footer.css';
import axios from 'axios';

function Footer() {
  const [lastUpdated, setLastUpdated] = useState("Loading...");

  useEffect(() => {
    const getLastUpdatedData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/');
        // "lastUpdated" is the name of the key in the JSON object returned by the server
        const lastUpdated = response.data.lastUpdated;
        setLastUpdated(lastUpdated);
      } catch (error) {
        console.error('Error retrieving lastUpdated data:', error);
      }
    };
    getLastUpdatedData(); // Call the function to get the data
  }); 

  return (
    <div className="footer">
      <p>Contact: 0118-999-881-999-119-7253</p>
      <p className="right">Last Updated: {lastUpdated}</p>
    </div>
  );
}

export default Footer;
