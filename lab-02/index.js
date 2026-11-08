/**
 * Lab 2: SQLite database and CRUD routes
 * Course: Backend Development Fundamentals (Year II Term II) - Aurora
 * Faculty: Sai Shiva Theja
 * 
 * Student Name: Padiga Sathwik
 * Registration Number: 252U1R1172
 * Section: CSE-2D
 */

const express = require('express');
const path = require('path');

let sqlite = null;
let sqlite3 = null;
try {
  sqlite = require('sqlite');
  sqlite3 = require('sqlite3');
} catch (e) {
  // Fallback if native bindings are restricted in serverless runtimes
}

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'books.db');

let db = null;

// Initial seed books (used directly if running in environments without native sqlite3)
let inMemoryBooks = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', price: 650, pages: 464 },
  { id: 2, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', price: 720, pages: 352 },
  { id: 3, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', price: 1200, pages: 1312 },
  { id: 4, title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 450, pages: 176 },
  { id: 5, title: 'Design Patterns', author: 'Erich Gamma', price: 850, pages: 395 },
  { id: 6, title: "You Don't Know JS Yet", author: 'Kyle Simpson', price: 500, pages: 142 },
  { id: 7, title: 'Refactoring', author: 'Martin Fowler', price: 780, pages: 448 },
  { id: 8, title: 'Cracking the Coding Interview', author: 'Gayle Laakmann McDowell', price: 900, pages: 687 },
  { id: 9, title: 'Head First Design Patterns', author: 'Eric Freeman', price: 699, pages: 694 },
  { id: 10, title: 'Database System Concepts', author: 'Abraham Silberschatz', price: 1100, pages: 1376 }
];

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Initialize Database connection and start server
const initializeDBAndServer = async () => {
  try {
    if (sqlite && sqlite3) {
      db = await sqlite.open({
        filename: dbPath,
        driver: sqlite3.Database
      });
      console.log('Connected to SQLite database successfully at:', dbPath);

      // Auto-create table if not exists
      await db.exec(`
        CREATE TABLE IF NOT EXISTS book (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          author TEXT NOT NULL,
          price INTEGER NOT NULL,
          pages INTEGER NOT NULL
        );
      `);

      const countRow = await db.get('SELECT COUNT(*) as count FROM book;');
      if (countRow.count === 0) {
        for (const book of inMemoryBooks) {
          await db.run(
            `INSERT INTO book (id, title, author, price, pages) VALUES (?, ?, ?, ?, ?);`,
            [book.id, book.title, book.author, book.price, book.pages]
          );
        }
        console.log('Seeded initial 10 books into database.');
      }
    }
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`Books SQLite API Server running on: http://localhost:${PORT}/`);
      console.log(`Student: Padiga Sathwik | 252U1R1172 | CSE-2D`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.log(`DB Connection Error: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

initializeDBAndServer();

// Root route
app.get('/', (request, response) => {
  response.send('Welcome to the Books SQLite API (Lab 2) - Padiga Sathwik (252U1R1172)');
});

// Student info route
app.get('/about', (request, response) => {
  response.status(200).json({
    studentName: 'Padiga Sathwik',
    registrationNumber: '252U1R1172',
    section: 'CSE-2D',
    course: 'Backend Development Fundamentals',
    lab: 'Lab 2: SQLite database and CRUD routes'
  });
});

// Task 4 & 5: GET /books/ - Get all books
app.get(['/books', '/books/'], async (request, response) => {
  try {
    if (db) {
      const getBooksQuery = `
        SELECT
          *
        FROM
          book
        ORDER BY
          id;
      `;
      const booksArray = await db.all(getBooksQuery);
      return response.status(200).json(booksArray);
    }
    return response.status(200).json(inMemoryBooks);
  } catch (err) {
    return response.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// Task 4 & 5: GET /books/:bookId/ - Get single book by ID
app.get(['/books/:bookId', '/books/:bookId/'], async (request, response) => {
  const { bookId } = request.params;
  try {
    if (db) {
      const getBookQuery = `
        SELECT
          *
        FROM
          book
        WHERE
          id = ?;
      `;
      const book = await db.get(getBookQuery, [bookId]);
      if (book === undefined) {
        return response.status(404).json({ error: 'Not Found', message: 'Book Not Found' });
      }
      return response.status(200).json(book);
    }

    const book = inMemoryBooks.find((b) => b.id === parseInt(bookId));
    if (!book) {
      return response.status(404).json({ error: 'Not Found', message: 'Book Not Found' });
    }
    return response.status(200).json(book);
  } catch (err) {
    return response.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// Task 4 & 5: POST /books/ - Add a new book
app.post(['/books', '/books/'], async (request, response) => {
  const bookDetails = request.body;
  const { title, author, price, pages } = bookDetails;

  if (!title || !author || price === undefined || pages === undefined) {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Missing required book details: title, author, price, and pages are mandatory.'
    });
  }

  try {
    if (db) {
      const addBookQuery = `
        INSERT INTO
          book (title, author, price, pages)
        VALUES
          (?, ?, ?, ?);
      `;
      const dbResponse = await db.run(addBookQuery, [title, author, price, pages]);
      const bookId = dbResponse.lastID;
      return response.status(201).json({ bookId: bookId, message: 'Book Successfully Added' });
    }

    const newId = inMemoryBooks.length > 0 ? Math.max(...inMemoryBooks.map((b) => b.id)) + 1 : 1;
    const newBook = { id: newId, title, author, price: parseInt(price), pages: parseInt(pages) };
    inMemoryBooks.push(newBook);
    return response.status(201).json({ bookId: newId, message: 'Book Successfully Added' });
  } catch (err) {
    return response.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// Task 4 & 5: PUT /books/:bookId/ - Update an existing book
app.put(['/books/:bookId', '/books/:bookId/'], async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const { title, author, price, pages } = bookDetails;

  try {
    if (db) {
      // First verify book exists
      const checkBook = await db.get(`SELECT id FROM book WHERE id = ?;`, [bookId]);
      if (!checkBook) {
        return response.status(404).json({ error: 'Not Found', message: 'Book Not Found' });
      }

      const updateBookQuery = `
        UPDATE
          book
        SET
          title = COALESCE(?, title),
          author = COALESCE(?, author),
          price = COALESCE(?, price),
          pages = COALESCE(?, pages)
        WHERE
          id = ?;
      `;
      await db.run(updateBookQuery, [title, author, price, pages, bookId]);
      return response.status(200).send('Book Updated Successfully');
    }

    const index = inMemoryBooks.findIndex((b) => b.id === parseInt(bookId));
    if (index !== -1) {
      inMemoryBooks[index] = {
        ...inMemoryBooks[index],
        title: title || inMemoryBooks[index].title,
        author: author || inMemoryBooks[index].author,
        price: price !== undefined ? parseInt(price) : inMemoryBooks[index].price,
        pages: pages !== undefined ? parseInt(pages) : inMemoryBooks[index].pages
      };
      return response.status(200).send('Book Updated Successfully');
    }
    return response.status(404).json({ error: 'Not Found', message: 'Book Not Found' });
  } catch (err) {
    return response.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// Task 4 & 5: DELETE /books/:bookId/ - Remove a book
app.delete(['/books/:bookId', '/books/:bookId/'], async (request, response) => {
  const { bookId } = request.params;

  try {
    if (db) {
      const checkBook = await db.get(`SELECT id FROM book WHERE id = ?;`, [bookId]);
      if (!checkBook) {
        return response.status(404).json({ error: 'Not Found', message: 'Book Not Found' });
      }

      const deleteBookQuery = `
        DELETE FROM
          book
        WHERE
          id = ?;
      `;
      await db.run(deleteBookQuery, [bookId]);
      return response.status(200).send('Book Deleted Successfully');
    }

    const index = inMemoryBooks.findIndex((b) => b.id === parseInt(bookId));
    if (index === -1) {
      return response.status(404).json({ error: 'Not Found', message: 'Book Not Found' });
    }
    inMemoryBooks = inMemoryBooks.filter((b) => b.id !== parseInt(bookId));
    return response.status(200).send('Book Deleted Successfully');
  } catch (err) {
    return response.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// Catch-all 404 handler for unknown routes
app.use((request, response) => {
  response.status(404).json({
    error: 'Not Found',
    message: `The requested path '${request.originalUrl}' does not exist on this server.`,
    statusCode: 404
  });
});

module.exports = app;

