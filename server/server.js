const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;
const ip = 'localhost';

// Middleware for parsing JSON request body
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Set up SQLite databases
const databases = [
  'Announce.db',
  'Books.db',
  'Checkouts.db',
  'Reviews.db',
  'Users.db',
  'Support.db'
];

const dbConnections = {};

const lastUpdated = new Date().toLocaleString('en-GB', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true
});

databases.forEach(dbName => {
  const dbPath = path.join(__dirname, 'Databases', dbName);
  const db = new sqlite3.Database(dbPath, err => {
    if (err) {
      console.error(`Error connecting to database "${dbName}":`, err);
    } else {
      console.log(`Connected to database "${dbName}"`);
    }
  });
  dbConnections[dbName] = db;
});

// Define routes
app.get('/', (req, res) => {
  res.send({lastUpdated});
});

app.get('/api/announcements', (req, res) => {
  const db = dbConnections['Announce.db'];
  db.all('SELECT * FROM announce', (err, rows) => {
    if (err) {
      console.error('Error retrieving data from "Announce.db":', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/books', (req, res) => {
  const db = dbConnections['Books.db'];
  db.all('SELECT * FROM books', (err, rows) => {
    if (err) {
      console.error('Error retrieving data from "Books.db":', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/books/recent', (req, res) => {
  const db = dbConnections['Books.db'];
  db.all('SELECT * FROM books ORDER BY WhenAdded DESC LIMIT 6', (err, rows) => {
    if (err) {
      console.error('Error retrieving data from "Books.db":', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/reviews/:id/', (req, res) => {
  const dbReviews = dbConnections['Reviews.db'];
  const dbUsers = dbConnections['Users.db'];

  dbReviews.all('SELECT * FROM reviews WHERE BookID = ?', [req.params.id], (err, reviewRows) => {
    if (err) {
      console.error('Error retrieving review data from "Reviews.db":', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (!reviewRows || reviewRows.length === 0) {
        // If no reviews are found for the given BookID, return an empty response
        res.json({ reviews: [] });
      } else {
        // Fetch the user's name from "Users.db" based on UserID for each review
        const reviewsWithUserName = [];
        let completed = 0;
        for (const reviewRow of reviewRows) {
          dbUsers.get('SELECT Username FROM users WHERE ID = ?', [reviewRow.UserID], (err, userRow) => {
            if (err) {
              console.error('Error retrieving user data from "Users.db":', err);
              res.status(500).json({ error: 'Internal Server Error' });
            } else {
              const reviewWithUserName = { ...reviewRow, userName: userRow ? userRow.Username : '' };
              reviewsWithUserName.push(reviewWithUserName);
              completed++;
              if (completed === reviewRows.length) {
                // All reviews have been processed, send the response
                res.json({ reviews: reviewsWithUserName });
              }
            }
          });
        }
      }
    }
  });
});

app.post('/api/reviews/:id/add', (req, res) => {
  const db = dbConnections['Reviews.db'];
  const dbUsers = dbConnections['Users.db'];
  const BookID = req.params.id; // Get BookID from URL params
  const { userName, Rating, Review } = req.body;

  if (!userName || !Rating || !Review) {
    // Invalid request body, missing userName, Rating, or Review
    res.status(400).json({ error: 'Missing userName, Rating, or Review' });
  } else {
    // Retrieve UserID based on userName from the database
    dbUsers.get('SELECT ID FROM users WHERE LOWER(userName) = LOWER(?)', [userName], (err, row) => {
      if (err) {
        console.error('Error retrieving UserID:', err);
        res.status(500).json({ error: 'Error retrieving UserID' });
      } else if (!row) {
        // No user found with the provided userName
        res.status(404).json({ error: 'User not found' });
      } else {
        const UserID = row.ID; // Extract UserID from the retrieved row
        // Insert review into the reviews table
        db.run('INSERT INTO reviews (UserID, BookID, Rating, Review) VALUES (?, ?, ?, ?)', [UserID, BookID, Rating, Review], err => {
          if (err) {
            console.error('Error adding review:', err);
            res.status(500).json({ error: 'Error adding review' });
          } else {
            res.json({ success: true });
          }
        });
      }
    });
  }
});

app.get('/api/books/:id/', (req, res) => {
  const db = dbConnections['Books.db'];
  db.all('SELECT * FROM books WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) {
      console.error('Error retrieving data from "Books.db":', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});


app.post('/api/users/login', (req, res) => {
  const db = dbConnections['Users.db'];
  const { Username, Password } = req.body;
  
  if (!Username || !Password) {
    // Invalid request body, missing Username or Password
    res.status(400).json({ error: 'Missing Username or Password' });
  } else {
    db.get('SELECT * FROM users WHERE Username = ? AND Password = ?', [Username, Password], (err, row) => {
      if (err) {
        console.error('Error authenticating user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (row) {
        // User authenticated successfully
        const { Staff } = row;
        res.json({ message: 'User authenticated successfully', staff: Staff });
      } else {
        // Invalid username or password
        res.status(401).json({ error: 'Invalid username or password' });
      }
    });
  }
});

app.post('/api/users/signup', (req, res) => {
  const db = dbConnections['Users.db'];
  const { FirstName, LastName, Email, Password, Username, DateOfBirth, Address, PhoneNumber } = req.body;

  if (!FirstName || !LastName || !Email || !Password || !Username || !DateOfBirth || !Address || !PhoneNumber) {
    // Invalid request body, missing required fields
    res.status(400).json({ error: 'There is a missing value in one of their fields; Please fix it and try again.' });
  } else {
    // Check for existing user with the same username
    db.get('SELECT * FROM users WHERE Username = ?', [Username], (err, row) => {
      if (err) {
        console.error('Error checking for existing user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (row) {
        // If a user with the same username already exists, throw an error
        res.status(409).json({ error: 'Username already exists' });
      } else {
        // If username is unique and all required fields are present, insert user data into Users.db database
        db.run('INSERT INTO users (FirstName, LastName, Email, Password, Username, DateOfBirth, Address, PhoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [FirstName, LastName, Email, Password, Username, DateOfBirth, Address, PhoneNumber], err => {
          if (err) {
            console.error('Error inserting user data into Users.db:', err);
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            res.json({ message: 'User created successfully' });
          }
        });
      }
    });
  }
});

app.get('/api/users/:name', (req, res) => {
  const db = dbConnections['Users.db'];
  db.get('SELECT * FROM users WHERE Username = ?', [req.params.name], (err, row) => {
    if (err) {
      console.error('Error retrieving data from "Users.db":', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (row) {
        res.json(row);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  });
});

app.post('/api/books/add', (req, res) => {
  const db = dbConnections['Books.db'];
  const { Title, Author, ISBN, Publisher, PublicationDate, Genre, Description, QRCode, BookCover, WhenAdded } = req.body;
  
  if (!Title || !Author || !ISBN || !PublicationDate || !Genre || !Description || !WhenAdded) {
    // Invalid request body, missing required fields
    res.status(400).json({ error: 'There is a missing value in one of their fields; Please fix it and try again.' });
  } else {
    // Check for existing book with the same ISBN
    db.get('SELECT * FROM books WHERE ISBN = ?', [ISBN], (err, row) => {
      if (err) {
        console.error('Error checking for existing book:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (row) {
        // If a book with the same ISBN already exists, throw an error
        res.status(409).json({ error: 'ISBN already exists' });
      } else {
        // If ISBN is unique and all required fields are present, insert book data into Books.db database
        db.run('INSERT INTO books (Title, Author, ISBN, Publisher, PublicationDate, Genre, Description, QRCode, BookCover, WhenAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [Title, Author, ISBN, Publisher, PublicationDate, Genre, Description, QRCode, BookCover, WhenAdded], err => {
          if (err) {
            console.error('Error inserting book data into Books.db:', err);
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            res.json({ message: 'Book added successfully' });
          }
        });
      }
    });
  }
});

app.post('/api/books/update', (req, res) => {
  const db = dbConnections['Books.db'];
  const { Title, Author, ISBN, Publisher, PublicationDate, Genre, Description, QRCode, BookCover, WhenAdded } = req.body;

  if (!Title || !Author || !ISBN || !Publisher || !PublicationDate || !Genre || !Description || !WhenAdded) {
    // Invalid request body, missing required fields
    res.status(400).json({ error: 'There is a missing value in one of the fields; Please fix it and try again.' });
  } else {
    // Check for existing book with the same Title
    db.get('SELECT * FROM books WHERE Title = ?', [Title], (err, row) => {
      if (err) {
        console.error('Error checking for existing book:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (row) {
        // If a book with the same Title already exists, update its data
        const ID = row.ID; // Get the ID of the existing book
        db.run('UPDATE books SET Title = ?, Author = ?, ISBN = ?, Publisher = ?, PublicationDate = ?, Genre = ?, Description = ?, QRCode = ?, BookCover = ?, WhenAdded = ? WHERE ID = ?', [Title, Author, ISBN, Publisher, PublicationDate, Genre, Description, QRCode || null, BookCover || null, WhenAdded, ID], err => {
          if (err) {
            console.error('Error updating book data in Books.db:', err);
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            res.json({ message: 'Book updated successfully' });
          }
        });
      } else {
        // Book not found with the given Title, check ISBN for a match
        db.get('SELECT * FROM books WHERE ISBN = ?', [ISBN], (err, row) => {
          if (err) {
            console.error('Error checking for existing book:', err);
            res.status(500).json({ error: 'Internal Server Error' });
          } else if (row) {
            // If a book with the same ISBN already exists, update its data
            const ID = row.ID; // Get the ID of the existing book
            db.run('UPDATE books SET Title = ?, Author = ?, ISBN = ?, Publisher = ?, PublicationDate = ?, Genre = ?, Description = ?, QRCode = ?, BookCover = ?, WhenAdded = ? WHERE ID = ?', [Title, Author, ISBN, Publisher, PublicationDate, Genre, Description, QRCode || null, BookCover || null, WhenAdded, ID], err => {
              if (err) {
                console.error('Error updating book data in Books.db:', err);
                res.status(500).json({ error: 'Internal Server Error' });
              } else {
                res.json({ message: 'Book updated successfully' });
              }
            });
          } else {
            // Book not found with the given ISBN
            res.status(404).json({ error: 'Book not found' });
          }
        });
      }
    });
  }
});

app.post('/api/books/delete', (req, res) => {
  const db = dbConnections['Books.db'];
  const { name } = req.body;

  if (!name) {
    // Invalid request body, missing required fields
    res.status(400).json({ error: 'There is a missing value in one of the fields; Please fix it and try again.' });
  } else {
    // Check for existing book with the given name
    db.get('SELECT * FROM books WHERE Title = ?', [name], (err, row) => {
      if (err) {
        console.error('Error checking for existing book:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (row) {
        // If a book with the given name exists, delete it
        const { ID } = row;
        db.run('DELETE FROM books WHERE ID = ?', [ID], function(err) {
          if (err) {
            console.error('Error deleting book data in Books.db:', err);
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            // Reset the ID counter to the next available value
            db.run(`UPDATE sqlite_sequence SET seq = ? WHERE name = ?`, [ID - 1, 'Books'], function(err) {
              if (err) {
                console.error('Error resetting ID counter:', err);
                res.status(500).json({ error: 'Internal Server Error' });
              } else {
                res.json({ message: 'Book deleted successfully' });
              }
            });
          }
        });
      } else {
        res.status(409).json({ error: 'Book does not exist' });
      }
    });
  }
});

app.post('/api/books/search', (req, res) => {
  const db = dbConnections['Books.db'];
  const { SearchTerm } = req.body;

  if (!SearchTerm) {
    // Invalid request body, missing required fields
    res.status(400).json({ error: 'There is a missing value in one of their fields; Please fix it and try again.' });
  } else if (SearchTerm.length < 2) {
    // Search term is too short, disallow one letter responses
    res.status(400).json({ error: 'Search term is too short; Please enter at least 2 characters.' });
  } else {
    // Check for existing book with the same Title
    db.all('SELECT * FROM books WHERE Title LIKE ?', ['%' + SearchTerm + '%'], (err, rows) => {
      if (err) {
        console.error('Error checking for existing book:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (rows && rows.length > 0) {
        // If a book with the same Title exists, return the rows
        res.json({ message: rows });
      } else {
        res.status(409).json({ error: 'Book does not exist' });
      }
    });
  }
});

app.get('/api/support', (req, res) => {
  const db = dbConnections['Support.db'];
  db.all('SELECT * FROM Support', (err, rows) => {
    if (err) {
      console.error('Error retrieving data from "Support.db":', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/support/add', (req, res) => {
  const db = dbConnections['Support.db'];
  const { Username, Email, Description } = req.body;

  if (!Username || !Email || !Description) {
    // Invalid request body, missing required fields
    res.status(400).json({ error: 'There is a missing value in one of the fields; Please fix it and try again.' });
  } else {
    db.run('INSERT INTO Support (Username, Email, Description) VALUES (?, ?, ?)', [Username, Email, Description], function(err) {
        if (err) {
          console.error('Error inserting data into "Support.db":', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.json({ message: 'Data added successfully' });
        }
      }
    );
  }
});

app.get('/api/checkout', (req, res) => {
  const db = dbConnections['Checkouts.db'];
  db.all('SELECT * FROM Checkouts', (err, rows) => {
    if (err) {
      console.error('Error retrieving data from "Checkouts.db":', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });});

app.post('/api/checkout/:id/add', (req, res) => {
  const db = dbConnections['Checkouts.db'];
  const dbUsers = dbConnections['Users.db'];
  const BookID = req.params.id; // Get BookID from URL params
  const { UserName, CheckoutDate, DueDate } = req.body;

  if (!UserName || !CheckoutDate || !DueDate) {
    // Invalid request body, missing UserName, CheckoutDate, or DueDate
    res.status(400).json({ error: 'Missing UserName, CheckoutDate, or DueDate' });
  } else {
    // Retrieve UserID based on UserName from the Users.db database
    dbUsers.get('SELECT ID FROM users WHERE LOWER(UserName) = LOWER(?)', [UserName], (err, row) => {
      if (err) {
        console.error('Error retrieving UserID:', err);
        res.status(500).json({ error: 'Error retrieving UserID' });
      } else if (!row) {
        // No user found with the provided UserName
        res.status(404).json({ error: 'User not found' });
      } else {
        const UserID = row.ID; // Extract UserID from the retrieved row
        // Insert checkout data into the Checkouts.db database
        db.run('INSERT INTO Checkouts (UserID, BookID, CheckoutDate, DueDate) VALUES (?, ?, ?, ?)', [UserID, BookID, CheckoutDate, DueDate], err => {
          if (err) {
            console.error('Error adding checkout:', err);
            res.status(500).json({ error: 'Error adding checkout' });
          } else {
            res.json({ success: true });
          }
        });
      }
    });
  }
});

app.get('/api/checkout/:name', (req, res) => {
  const db = dbConnections['Checkouts.db'];
  const dbBooks = dbConnections['Books.db'];
  const dbUsers = dbConnections['Users.db'];
  const UserName = req.params.name; // Get UserName from URL params

  if (!UserName) {
    // Invalid request body, missing UserName
    res.status(400).json({ error: 'Missing UserName' });
  } else {
    // Retrieve UserID based on UserName from the Users.db database
    dbUsers.get('SELECT ID FROM users WHERE LOWER(UserName) = LOWER(?)', [UserName], (err, row) => {
      if (err) {
        console.error('Error retrieving UserID:', err);
        res.status(500).json({ error: 'Error retrieving UserID' });
      } else if (!row) {
        // No user found with the provided UserName
        res.status(404).json({ error: 'User not found' });
      } else {
        const UserID = row.ID; // Extract UserID from the retrieved row
        // Retrieve all checkouts for the user
        db.all('SELECT * FROM Checkouts WHERE UserID = ?', [UserID], (err, rows) => {
          if (err) {
            console.error('Error retrieving checkouts:', err);
            res.status(500).json({ error: 'Error retrieving checkouts' });
          } else if (!rows || rows.length === 0) {
            // No checkouts found for the user
            res.status(404).json({ error: 'No checkouts found for user' });
          } else {
            // Retrieve all books for the user's checkouts
            dbBooks.all('SELECT * FROM Books WHERE ID IN (' + rows.map(row => row.BookID).join(',') + ')', (err, books) => {
              if (err) {
                console.error('Error retrieving books:', err);
                res.status(500).json({ error: 'Error retrieving books' });
              }
              // Add the book data to the checkout data
              const checkouts = rows.map(row => {
                const book = books.find(book => book.ID === row.BookID);
                return { ...row, book };
              });
              res.json(checkouts);
            });
          }
        });
      }
    });
  }
});    

app.get('/api/checkout/:name/current', (req, res) => {
  const db = dbConnections['Checkouts.db'];
  const dbBooks = dbConnections['Books.db'];
  const dbUsers = dbConnections['Users.db'];
  const UserName = req.params.name; // Get UserName from URL params

  if (!UserName) {
    // Invalid request body, missing UserName
    res.status(400).json({ error: 'Missing UserName' });
  } else {
    // Retrieve UserID based on UserName from the Users.db database
    dbUsers.get('SELECT ID FROM users WHERE LOWER(UserName) = LOWER(?)', [UserName], (err, row) => {
      if (err) {
        console.error('Error retrieving UserID:', err);
        res.status(500).json({ error: 'Error retrieving UserID' });
      } else if (!row) {
        // No user found with the provided UserName
        res.status(404).json({ error: 'User not found' });
      } else {
        const UserID = row.ID; // Extract UserID from the retrieved row
        // Retrieve all checkouts for the user
        db.all('SELECT * FROM Checkouts WHERE UserID = ? AND DueDate > ?', [UserID, new Date()], (err, rows) => {
          if (err) {
            console.error('Error retrieving checkouts:', err);
            res.status(500).json({ error: 'Error retrieving checkouts' });
          } else if (!rows || rows.length === 0) {
            // No checkouts found for the user
            res.status(404).json({ error: 'No checkouts found for user' });
          } else {
            // Retrieve all books for the user's checkouts
            dbBooks.all('SELECT * FROM Books WHERE ID IN (' + rows.map(row => row.BookID).join(',') + ')', (err, books) => {
              if (err) {
                console.error('Error retrieving books:', err);
                res.status(500).json({ error: 'Error retrieving books' });
              }
              // Add the book data to the checkout data
              const checkouts = rows.map(row => {
                const book = books.find(book => book.ID === row.BookID);
                return { ...row, book };
              });
              res.json(checkouts);
            });
          }
        });
      }
    });
  }
});

app.listen(port, ip, () => {
    console.log(`Adjunct Library Systems API listening on ${ip}:${port}`)
  })
