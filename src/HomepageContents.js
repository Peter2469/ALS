import React, { useEffect, useState } from 'react';
import './HomepageContents.css';
import axios from 'axios';

function HomepageContents() {
  const [announcements, setAnnouncements] = useState([]);
  const [recentlyAddedBooks, setRecentlyAddedBooks] = useState([]);

  useEffect(() => {
    // Fetch announcements
    axios.get('http://localhost:4000/api/announcements')
      // Sets the announcements state with the data from the API
      .then(response => setAnnouncements(response.data))
      .catch(error => console.error('Error fetching announcements:', error));

    // Fetch recently added books
    axios.get('http://localhost:4000/api/books/recent')
       // Sets the recentlyAddedBooks state with the data from the API
      .then(response => setRecentlyAddedBooks(response.data))
      .catch(error => console.error('Error fetching recently added books:', error));
  }, []);

  return (
    <div className="allow-homepage-overflow">
      <div className="HomepageContents-Start">
        <div className="Contents">
          <div>
            <div className="header-font">
              <h2>Announcements</h2>
            </div>
            <div className="content">
              { /* Loops through the announcements array and renders each announcement */ }
              {announcements.map(announcement => (
                <div key={announcement.ID} className="item">
                  <h3>{announcement.AnnounceTitle}</h3>
                  <p>{announcement.AnnounceDesc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="header-font">
              <h2>Recently Added</h2>
            </div>
            <div className="content">
              {/* Loops through the recentlyAddedBooks array and renders each book */}
              {recentlyAddedBooks.map(book => (
                <div key={book.ID} className="item">
                  <a href={`/books/${book.ID}`}>
                    <h3>{book.Title}</h3>
                  </a>
                  <p>{book.Description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomepageContents;
