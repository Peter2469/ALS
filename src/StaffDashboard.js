import React, { useEffect, useState } from 'react';
import './StaffDashboard.css';
import axios from 'axios';

function StaffDashboard() {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [formData, setFormData] = useState({
    Title: '',
    Author: '',
    ISBN: '',
    Publisher: '',
    PublicationDate: '',
    Genre: '',
    Description: '',
    QRCode: '',
    BookCover: '',
    WhenAdded: ''
  });
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

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  }

  const handleBookSelect = (selectedBook) => {
    if (selectedBook) {
      setSelectedBook(selectedBook);
      setFormData({
        Title: selectedBook.Title,
        Author: selectedBook.Author,
        ISBN: selectedBook.ISBN,
        Publisher: selectedBook.Publisher,
        PublicationDate: selectedBook.PublicationDate,
        Genre: selectedBook.Genre,
        Description: selectedBook.Description,
        QRCode: selectedBook.QRCode,
        BookCover: selectedBook.BookCover,
        WhenAdded: selectedBook.WhenAdded
      });
    }else{
      setSelectedBook('');
      setFormData({
        Title: '',
        Author: '',
        ISBN: '',
        Publisher: '',
        PublicationDate: '',
        Genre: '',
        Description: '',
        QRCode: '',
        BookCover: '',
        WhenAdded: ''
      });
    }
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission based on the selected option
    if (selectedOption === 'add') {
      try {
        axios.post(`http://localhost:4000/api/books/add`, formData);
        alert("Add Submitted");
      } catch (error) {
        console.error('Error adding book:', error);
      }
    } else if (selectedOption === 'update') {
      try {
        axios.post(`http://localhost:4000/api/books/update`, formData);
        alert("Update Submitted for " + selectedBook.Title);
      } catch (error) {
        console.error('Error updating book:', error);
      }
        } else if (selectedOption === 'delete') {
      const deleteConfirmation = window.confirm("Are you sure you want to delete " + selectedBook.Title + "?");
      if(deleteConfirmation){
        try{
          const requestBody = { name: selectedBook.Title };
          axios.post(`http://localhost:4000/api/books/delete`, requestBody);
          alert("Deleted " + selectedBook.Title + "");
        }catch(error){
          console.error('Error deleting book:', error);
        }
      }
    }
  }

  const name = document.cookie.replace(/(?:(?:^|.*;\s*)Username\s*=\s*([^;]*).*$)|^.*$/, "$1");
  const staff = document.cookie.replace(/(?:(?:^|.*;\s*)Staff\s*=\s*([^;]*).*$)|^.*$/, "$1");

  return (
    <div className="App">
      {staff === "1" ? (
        <header className="SDashboard-Start">
          <h1>Welcome {name} to the Staff Dashboard</h1>
          <p className='SDashboard-Description'>This page will allow you to Add, Update, Delete any Book</p>
          <form class="book-form" onSubmit={handleSubmit}>
            <h1>Book Information</h1>
            <div class="radio-group">
              <input type="radio" name="Add" value="add" checked={selectedOption === 'add'} onChange={() => handleOptionChange('add')}/>
              <label htmlFor="Add">Add</label>
              <input type="radio" name="Update" value="update" checked={selectedOption === 'update'} onChange={() => handleOptionChange('update')} />
              <label htmlFor="Update">Update</label>
              <input type="radio" name="Delete" value="delete" checked={selectedOption === 'delete'} onChange={() => handleOptionChange('delete')} />
              <label htmlFor="Delete">Delete</label>
            </div>
            {selectedOption && (
              <div>
                {/* Only show the input fields if the user is adding or updating a book */}
                {(selectedOption === 'add' || selectedOption === 'update') && (
                  <div>
                    <input type="text" name="Title" value={formData.Title} onChange={handleInputChange} placeholder="Title" />
                    <input type="text" name="Author" value={formData.Author} onChange={handleInputChange} placeholder="Author"/>
                    <input type="text" name="ISBN" value={formData.ISBN} onChange={handleInputChange} placeholder="ISBN"/>
                    <input type="text" name="Publisher" value={formData.Publisher} onChange={handleInputChange} placeholder="Publisher"/>
                    <input type="date" name="PublicationDate" value={formData.PublicationDate} onChange={handleInputChange} placeholder="PublicationDate"/>
                    <input type="text" name="Genre" value={formData.Genre} onChange={handleInputChange} placeholder="Genre"/>
                    <input type="text" name="Description" value={formData.Description} onChange={handleInputChange} placeholder="Description"/>
                    <input type="text" name="QRCode" value={formData.QRCode} onChange={handleInputChange} placeholder="QRCode"/>
                    <input type="text" name="BookCover" value={formData.BookCover} onChange={handleInputChange} placeholder="BookCover"/>
                    <input type="date" name="WhenAdded" value={formData.WhenAdded} onChange={handleInputChange} placeholder="WhenAdded"/>
                  </div>
                )}
                {/* Only show the select dropdown if the user is updating or deleting a book */}
                {selectedOption === 'update' || selectedOption === 'delete' ? (
                  <select onChange={(event) => handleBookSelect(books.find(book => book.Title === event.target.value))}>
                    <option value="">Select a book</option>
                    {books.map(book => (
                      <option key={book.ID} value={book.Title}>{book.Title}</option>
                    ))}
                  </select>              
                ) : null}
                <input type="submit" value="Submit" />
              </div>
            )}
          </form>
        </header>
      ) : (
        <header className="SDashboard-Start">
          <p1 class="error-message">You are not Staff or logged in!</p1>
        </header>
      )}
    </div>
  );  
}

export default StaffDashboard;
