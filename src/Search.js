import './Search.css';
import React, { useState, useEffect } from "react";
import axios from 'axios';

function Search() {
  const [searchResults, setSearchResults] = useState([]); // State to store search results

  useEffect(() => {
    // Extract search query from URL and make API call
    const searchQuery = new URLSearchParams(window.location.search).get('q');
    if (searchQuery) {
      axios.post(`http://localhost:4000/api/books/search`, { SearchTerm: searchQuery }, {
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        if (response.status === 200) {
          return response.data;
        } else {
          throw new Error("Book does not exist");
        }
      })
      .then(data => {
        setSearchResults(data.message);
      })
      .catch(error => {
        console.error("Error searching for books:", error);
        setSearchResults([]);
        alert("No search results found");
      });
    } else {
      setSearchResults([]);
      alert("No search results found");
    }
  }, []);

  return (
    <div className="Search-Start">
      <div className="search-results">
        <div className="header-font">
          <h2>Search Results</h2>
        </div>
        <div className="Search-Content">
          {searchResults.map(book => (
            <div key={book.ID} className="item">
              <a href={`/books/${book.ID}`}>
                <h3>{book.Title}</h3>
              </a>
              <p>Author: {book.Author}</p>
              <p>ISBN: {book.ISBN}</p>
              <p>Publisher: {book.Publisher}</p>
              <p>Publication Date: {book.PublicationDate}</p>
              <p>Genre: {book.Genre}</p>
              <p>Description: {book.Description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Search;
