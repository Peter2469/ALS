import React, { useEffect, useState } from 'react';
import './BookDetails.css';
import axios from 'axios';
import QRCode from 'react-qr-code';

function BookDetails() {
  const [formData, setFormData] = useState({
    userName: '',
    Review: '',
    Rating: 0
  });
  
  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const id = window.location.pathname.split('/').pop();
    axios.post(`http://localhost:4000/api/reviews/${id}/add`, formData)
      .then(response => {
        // Handle Successful Response
        console.log('Review created successfully:', response.data);
        alert('Review created successfully!');
        // Reset form inputs
        setFormData({
          userName: '',
          Review: '',
          Rating: 0
        });
      })
      .catch(error => {
        // Catch Error
        console.error('Error creating review:', error);
        alert('Error creating review!');
      });
  };

  const [checkout, setCheckout] = useState({
    UserName: '',
    CheckoutDate: '',
    DueDate: ''
  });
  
  const handleCheckout = (event) => {
    event.preventDefault();
    const id = window.location.pathname.split('/').pop();
    axios.post(`http://localhost:4000/api/checkout/${id}/add`, checkout)
      .then(response => {
        // Handle Successful Response
        alert('The book has been checked out!');
        console.log('Checkout created successfully:', response.data);
        // Reset form inputs
        setCheckout({
          UserName: '',
          CheckoutDate: '',
          DueDate: ''
        });
      })
      .catch(error => {
        // Catch Error
        console.error('Error creating checkout:', error);
        alert('Error creating checkout!');
      });
  };

  const [book, setBook] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const id = window.location.pathname.split('/').pop();
        const response = await axios.get(`http://localhost:4000/api/books/${id}`);
        if (response.status === 200) {
          const data = response.data;
          if (data && data.length === 0) {
            setError(false);
            setBook(null);
          } else {
            setError(false);
            setBook(data[0]);
          }
        } else {
          console.error('Error fetching book data:', response.status);
          setError(true);
        }
      } catch (error) {
        console.error('Error fetching book data:', error);
        setError(true);
      }
    };

    fetchBookData();
  }, []);

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        const id = window.location.pathname.split('/').pop();
        const response = await axios.get(`http://localhost:4000/api/reviews/${id}`);
        if (response.status === 200) {
          const data = response.data;
          if (data && data.reviews.length === 0) {
            setError(false);
            setReviews([]);
          } else {
            setError(false);
            setReviews(data.reviews);
          }
        } else {
          console.error('Error fetching review data:', response.status);
          setError(true);
        }
      } catch (error) {
        console.error('Error fetching review data:', error);
        setError(true);
      }
    };

    fetchReviewData();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckoutChange = (event) => {
    const { name, value } = event.target;
    setCheckout(prevState => ({ ...prevState, [name]: value }));

    if (name === 'CheckoutDate') {
      const date = new Date(value);
      date.setDate(date.getDate() + 14);
      setCheckout(prevState => ({ ...prevState, DueDate: date.toISOString().split('T')[0] }));
    }
  };

  return (
    <div className="allow-overflow">
      <div className="BookDetails-Start">
        <header className="search-results">
          {error ? (
            <p>Error loading book data</p>
          ) : book ? (
            <div className="book-details-container">
              <div className="book-details-left">
                <h3>{book.Title}</h3>
                <img src={`./images/Books/${book.ID}.jpg`} alt={`Book Cover for ${book.Title}`} className ="book-image" onError={(e) => {e.target.src = 'https://via.placeholder.com/300x500';}}/>
                <div class="book-info">
                  <p>Author: {book.Author}</p>
                  <p>ISBN: {book.ISBN}</p>
                  <p>Genre: {book.Genre}</p>
                </div>
                <div class="book-info">
                  <p>Publisher: {book.Publisher}</p>
                  <p>Year: {book.PublicationDate}</p>
                </div>
                <div class="qr-code">
                  <QRCode value={window.location.href} size={256} />
                </div>
                <div>
                  <h2>Checkout Form</h2>
                  <form className="checkout-form" onSubmit={handleCheckout}>
                    <input type="text" id="userName" name="UserName" value={checkout.UserName} onChange={handleCheckoutChange} placeholder="Username" />
                    <br />
                    <input type="date" id="checkoutDate" name="CheckoutDate" value={checkout.CheckoutDate} onChange={handleCheckoutChange} placeholder="Checkout Date" />
                    <br />
                    <input type="date" id="dueDate" name="DueDate" value={checkout.DueDate} readOnly />
                    <br />
                    <button type="submit">Submit</button>
                  </form>
                </div>
              </div>
              <div className="book-details-middle">
                <h3>Description</h3>
                <p>{book.Description}</p>
              </div>
              <div className="book-details-right">
              <h2>Reviews</h2>
                {reviews.map((review) => (
                  <div class = "reviews" key={book.ID}>
                    <p>{review.Review}</p>
                    <p>Username: {review.userName} | Rating {review.Rating}/5</p>
                  </div>
                ))}
                  <div>
                    <h2>Review Form</h2>
                    <form className="review-form" onSubmit={handleSubmit}>
                      <input type="text" id="userName" name="userName" value={formData.userName} onChange={handleInputChange} placeholder='Username'/>
                      <br />
                      <input type="number" id="rating" name="Rating" value={formData.Rating} onChange={handleInputChange} placeholder="Rating" min={0} max={5} step={.5}/>
                      <br />
                      <input type="text" id="review" name="Review" value={formData.Review} onChange={handleInputChange} placeholder="Review"/>
                      <br />
                      <button type="submit">Submit</button>
                    </form>
                  </div>
              </div>
            </div>
          ) : (
            <p>Book not found</p>
          )}
        </header>
      </div>
    </div>
  );
}

export default BookDetails;
