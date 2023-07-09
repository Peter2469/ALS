import React, { useState, useEffect } from 'react';
import './Books.css';
import axios from 'axios';

function Books() {
  const [books, setBooks] = useState([]); // State to store the books

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/books');
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="BookStart">
      <header className="search-results">
        <div className="header-font">
          <h2>Books</h2>
        </div>
        <div className="content">
          {books.map(book => (
            <div key={book.ID} className='item'>
              <a href={`/books/${book.ID}`}>
                <h3>{book.Title}</h3>
              </a>
              <p><strong>Author:</strong> {book.Author}</p>
                <p><strong>ISBN:</strong> {book.ISBN}</p>
                <p><strong>Publisher:</strong> {book.Publisher}</p>
                <p><strong>Publication Date:</strong> {book.PublicationDate}</p>
                <p><strong>Genre:</strong> {book.Genre}</p>
                <p><strong>Description:</strong> {book.Description}</p>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default Books;
