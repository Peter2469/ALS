import React, { useState } from 'react';
import './UserDashboard.css';
import axios from 'axios';

function UserDashboard() {
  const [borrowedHistory, setBorrowedHistory] = useState([]);
  const [buttonLabel, setButtonLabel] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const handleButtonClick = async (buttonLabel) => {
    // Function to handle button click event
    if (buttonLabel === 'Borrowed History') {
      try {
        const name = document.cookie.replace(/(?:(?:^|.*;\s*)Username\s*=\s*([^;]*).*$)|^.*$/, "$1");
        const response = await axios.get(`http://localhost:4000/api/checkout/${name}`);
        setBorrowedHistory(response.data);
        setButtonLabel(buttonLabel);
      } catch (error) {
        console.error('Error fetching borrowed history:', error);
      }
    }else if (buttonLabel === 'Borrowed Books') {
      try {
        const name = document.cookie.replace(/(?:(?:^|.*;\s*)Username\s*=\s*([^;]*).*$)|^.*$/, "$1");
        const response = await axios.get(`http://localhost:4000/api/checkout/${name}/current`);
        setBorrowedHistory(response.data);
        setButtonLabel(buttonLabel);
      } catch (error) {
        console.error('Error fetching borrowed history:', error);
      }
    } else if (buttonLabel === 'Account Information'){
        try {
          const name = document.cookie.replace(/(?:(?:^|.*;\s*)Username\s*=\s*([^;]*).*$)|^.*$/, "$1");
          const response = await axios.get(`http://localhost:4000/api/users/${name}`);
          setUserInfo(response.data);
          setButtonLabel(buttonLabel);
        } catch (error) {
          console.error('Error fetching user information:', error);
        }
      };
    };

  const name = document.cookie.replace(/(?:(?:^|.*;\s*)Username\s*=\s*([^;]*).*$)|^.*$/, "$1");

  return (
    <div className="App">
      {name !== '' ? (
        <header className="UserDashboard-Start">
          <div className="UserDashboard-Content">
            <h1 className="UserDashboard-Title">Welcome {name}!</h1>
            <p className="UserDashboard-Description">Here you can view your account information, view your borrowed books, and view your borrowed history.</p>
            <div className="UserDashboard-Buttons">
              <button className="UserDashboard-Button" onClick={() => handleButtonClick('Account Information')}>Account Information</button>
              <button className="UserDashboard-Button" onClick={() => handleButtonClick('Borrowed Books')}>Borrowed Books</button>
              <button className="UserDashboard-Button" onClick={() => handleButtonClick('Borrowed History')}>Borrowed History</button>
            </div>
            {/* Render borrowed history data */}
            {borrowedHistory.length > 0 && (
              <div>
                {buttonLabel !== 'Account Information' ? (
                  <div>
                    <h2>{buttonLabel}</h2>
                    <table className="UserDashboard-Table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Checkout Date</th>
                          <th>Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {borrowedHistory.map(item => (
                          <tr key={item.id}>
                            <td>
                              <a href={`/books/${item.book.ID}`} className="BookLink">{item.book.Title}</a>
                            </td>
                            <td>{item.CheckoutDate}</td>
                            <td>{item.DueDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  buttonLabel === 'Account Information' && (
                    <div>
                      <h2>Account Information</h2>
                      <div className="UserDashboard-AccountInfo">
                        <p><strong>Username:</strong> {userInfo.Username}</p>
                        <p><strong>First Name:</strong> {userInfo.FirstName}</p>
                        <p><strong>Last Name:</strong> {userInfo.LastName}</p>
                        <p><strong>Email:</strong> {userInfo.Email}</p>
                        <p><strong>Date of Birth:</strong> {userInfo.DateOfBirth}</p>
                        <p><strong>Address:</strong> {userInfo.Address}</p>
                        <p><strong>Phone Number:</strong> {userInfo.PhoneNumber}</p>
                        <p>Password is not displayed for security reasons.</p>
                      </div>
                    </div>
                    )
                )}
              </div>
            )}
          </div>
        </header>
      ) : (
        <header className="UserDashboard-Start">
          <p1 className="error-message">You are not logged in!</p1>
        </header>
      )}
    </div>
  );
}  
export default UserDashboard;
