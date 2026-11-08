/**
 * Lab 3: REST API, query parameters, validation, debugging
 * 
 * Student: Padiga Sathwik
 * Registration Number: 252U1R1172
 * Section: CSE-2D
 * Faculty: Mr Sai siva teja
 * University: Aurora Deemed to be University
 * Course: Backend Development Fundamentals (Year II Term II)
 */

const express = require("express");
const path = require("path");

let sqlite = null;
let sqlite3 = null;
try {
  sqlite = require("sqlite");
  sqlite3 = require("sqlite3");
} catch (e) {
  // Serverless fallback if native C++ bindings cannot load
}

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "goodreads.db");
let db = null;

// Initial sample books (auto-seeded on startup or used in serverless fallback)
let inMemoryBooks = [
  { id: 1, title: "Harry Potter", author: "J.K. Rowling", price: 500, pages: 350 },
  { id: 2, title: "The Hobbit", author: "J.R.R. Tolkien", price: 400, pages: 310 },
  { id: 3, title: "Wings of Fire", author: "A.P.J. Abdul Kalam", price: 250, pages: 180 },
  { id: 4, title: "The Alchemist", author: "Paulo Coelho", price: 300, pages: 200 },
  { id: 5, title: "Atomic Habits", author: "James Clear", price: 450, pages: 320 },
  { id: 6, title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", price: 350, pages: 240 },
  { id: 7, title: "Think and Grow Rich", author: "Napoleon Hill", price: 280, pages: 260 },
  { id: 8, title: "Ikigai", author: "Hector Garcia", price: 320, pages: 190 },
  { id: 9, title: "Deep Work", author: "Cal Newport", price: 400, pages: 280 },
  { id: 10, title: "The Power of Habit", author: "Charles Duhigg", price: 380, pages: 290 }
];

// ---------- Helpers & Validation ----------

// Allow-lists for ORDER BY to prevent SQL injection
const ALLOWED_ORDER_BY = ["id", "title", "author", "price", "pages"];
const ALLOWED_ORDER = ["ASC", "DESC"];

const isBlank = (value) => typeof value !== "string" || value.trim() === "";

// Returns error message if body is invalid, otherwise null
const validateBook = (body) => {
  const { title, author, price, pages } = body || {};

  if (isBlank(title)) {
    return "title is required and must be a non-empty string";
  }
  if (isBlank(author)) {
    return "author is required and must be a non-empty string";
  }
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return "price is required and must be a non-negative number";
  }
  if (pages !== undefined && (!Number.isInteger(pages) || pages <= 0)) {
    return "pages, if provided, must be a positive whole number";
  }
  return null;
};

// Returns positive integer id or null
const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ---------- Initialize Database and Server ----------

const initializeDBAndServer = async () => {
  try {
    if (sqlite && sqlite3) {
      db = await sqlite.open({
        filename: dbPath,
        driver: sqlite3.Database,
      });

      await db.exec(`
        CREATE TABLE IF NOT EXISTS book (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          author TEXT,
          price INTEGER,
          pages INTEGER
        );
      `);

      const books = await db.all("SELECT * FROM book;");

      if (books.length === 0) {
        await db.run(`
          INSERT INTO book (title, author, price, pages)
          VALUES
            ('Harry Potter', 'J.K. Rowling', 500, 350),
            ('The Hobbit', 'J.R.R. Tolkien', 400, 310),
            ('Wings of Fire', 'A.P.J. Abdul Kalam', 250, 180),
            ('The Alchemist', 'Paulo Coelho', 300, 200),
            ('Atomic Habits', 'James Clear', 450, 320),
            ('Rich Dad Poor Dad', 'Robert Kiyosaki', 350, 240),
            ('Think and Grow Rich', 'Napoleon Hill', 280, 260),
            ('Ikigai', 'Hector Garcia', 320, 190),
            ('Deep Work', 'Cal Newport', 400, 280),
            ('The Power of Habit', 'Charles Duhigg', 380, 290);
        `);
        console.log("Database seeded with sample books.");
      }
    }

    const port = process.env.PORT || 3000;

    app.listen(port, (error) => {
      if (error) {
        console.error("Server failed to start:", error.message);
        process.exit(1);
      }
      console.log(`=================================================`);
      console.log(`Lab 3 REST API Server running on port ${port}`);
      console.log(`Student: Padiga Sathwik | 252U1R1172 | CSE-2D`);
      console.log(`Faculty: Mr Sai siva teja`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error("Database or Server Error:", error.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

// ---------- Routes ----------

// Root welcome route
app.get("/", (request, response) => {
  response.status(200).json({
    message: "Welcome to Lab 3: REST API, Query Parameters & Validation",
    studentName: "Padiga Sathwik",
    registrationNumber: "252U1R1172",
    section: "CSE-2D",
    faculty: "Mr Sai siva teja",
    university: "Aurora Deemed to be University"
  });
});

// Student info route
app.get("/about", (request, response) => {
  response.status(200).json({
    studentName: "Padiga Sathwik",
    registrationNumber: "252U1R1172",
    section: "CSE-2D",
    faculty: "Mr Sai siva teja",
    university: "Aurora Deemed to be University",
    course: "Backend Development Fundamentals (Year II Term II)",
    lab: "Lab 3: REST API, query parameters, validation, debugging"
  });
});

// Debugging fixes summary route
app.get("/debug-fixes", (request, response) => {
  response.status(200).json({
    exercise: "Lab 3 Debugging Exercise Solutions",
    fixes: [
      {
        problem: "Port conflict (listen EADDRINUSE :::3000)",
        solution: "Used process.env.PORT || 3000 and ended previous running node processes."
      },
      {
        problem: "Wrong import path (Cannot find module)",
        solution: "Used path.join(__dirname, 'goodreads.db') for robust absolute path resolution."
      },
      {
        problem: "Table name typo (SQLITE_ERROR: no such table)",
        solution: "Standardized table name to 'book' matching CREATE TABLE definition."
      },
      {
        problem: "Missing await in async database calls",
        solution: "Added await to db.open, db.all, db.get, and db.run inside async functions."
      }
    ]
  });
});

// GET /books/ : Search, sort, filter by price range, and paginate
// Example: /books/?search_q=the&min_price=300&max_price=450&order_by=price&order=DESC&limit=5&offset=0
app.get("/books/", async (request, response) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price = "0",
      max_price,
    } = request.query;

    const orderBy = String(order_by);
    const orderDir = String(order).toUpperCase();
    const limitNum = Number(limit);
    const offsetNum = Number(offset);
    const minPrice = Number(min_price);
    const maxPrice =
      max_price === undefined ? Number.MAX_SAFE_INTEGER : Number(max_price);

    if (!ALLOWED_ORDER_BY.includes(orderBy)) {
      return response.status(400).json({
        message: `order_by must be one of: ${ALLOWED_ORDER_BY.join(", ")}`,
      });
    }
    if (!ALLOWED_ORDER.includes(orderDir)) {
      return response.status(400).json({ message: "order must be ASC or DESC" });
    }
    if (!Number.isInteger(limitNum) || limitNum < 1) {
      return response
        .status(400)
        .json({ message: "limit must be a positive whole number" });
    }
    if (!Number.isInteger(offsetNum) || offsetNum < 0) {
      return response
        .status(400)
        .json({ message: "offset must be a whole number, 0 or more" });
    }
    if (Number.isNaN(minPrice) || Number.isNaN(maxPrice)) {
      return response
        .status(400)
        .json({ message: "min_price and max_price must be numbers" });
    }
    if (minPrice > maxPrice) {
      return response
        .status(400)
        .json({ message: "min_price cannot be greater than max_price" });
    }

    if (db) {
      const query = `
        SELECT * FROM book
        WHERE title LIKE ?
          AND price BETWEEN ? AND ?
        ORDER BY ${orderBy} ${orderDir}
        LIMIT ? OFFSET ?;
      `;

      const books = await db.all(query, [
        `%${String(search_q)}%`,
        minPrice,
        maxPrice,
        limitNum,
        offsetNum,
      ]);

      return response.status(200).json(books);
    }

    // In-memory fallback
    let filtered = inMemoryBooks.filter((b) =>
      b.title.toLowerCase().includes(String(search_q).toLowerCase()) &&
      b.price >= minPrice &&
      b.price <= maxPrice
    );

    filtered.sort((a, b) => {
      let valA = a[orderBy];
      let valB = b[orderBy];
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return orderDir === "ASC" ? -1 : 1;
      if (valA > valB) return orderDir === "ASC" ? 1 : -1;
      return 0;
    });

    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);
    return response.status(200).json(paginated);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

// GET /books/:bookId/ : Get single book by ID
app.get("/books/:bookId/", async (request, response) => {
  try {
    const bookId = parseId(request.params.bookId);
    if (bookId === null) {
      return response
        .status(400)
        .json({ message: "bookId must be a positive whole number" });
    }

    if (db) {
      const book = await db.get("SELECT * FROM book WHERE id = ?;", [bookId]);
      if (!book) {
        return response.status(404).json({ message: "Book not found" });
      }
      return response.status(200).json(book);
    }

    const book = inMemoryBooks.find((b) => b.id === bookId);
    if (!book) {
      return response.status(404).json({ message: "Book not found" });
    }
    return response.status(200).json(book);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

// POST /books/ : Add a new book (with strict validation)
app.post("/books/", async (request, response) => {
  try {
    const errorMessage = validateBook(request.body);
    if (errorMessage) {
      return response.status(400).json({ message: errorMessage });
    }

    const { title, author, price, pages = null } = request.body;

    if (db) {
      const result = await db.run(
        "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);",
        [title.trim(), author.trim(), price, pages]
      );

      return response.status(201).json({
        message: "Book added successfully",
        bookId: result.lastID,
      });
    }

    const newId = inMemoryBooks.length > 0 ? Math.max(...inMemoryBooks.map((b) => b.id)) + 1 : 1;
    const newBook = { id: newId, title: title.trim(), author: author.trim(), price, pages };
    inMemoryBooks.push(newBook);
    return response.status(201).json({
      message: "Book added successfully",
      bookId: newId,
    });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

// PUT /books/:bookId/ : Update book by ID (with validation and 404 check)
app.put("/books/:bookId/", async (request, response) => {
  try {
    const bookId = parseId(request.params.bookId);
    if (bookId === null) {
      return response
        .status(400)
        .json({ message: "bookId must be a positive whole number" });
    }

    const errorMessage = validateBook(request.body);
    if (errorMessage) {
      return response.status(400).json({ message: errorMessage });
    }

    const { title, author, price, pages = null } = request.body;

    if (db) {
      const result = await db.run(
        `UPDATE book
         SET title = ?, author = ?, price = ?, pages = ?
         WHERE id = ?;`,
        [title.trim(), author.trim(), price, pages, bookId]
      );

      if (result.changes === 0) {
        return response.status(404).json({ message: "Book not found" });
      }

      return response.status(200).json({ message: "Book updated successfully" });
    }

    const index = inMemoryBooks.findIndex((b) => b.id === bookId);
    if (index === -1) {
      return response.status(404).json({ message: "Book not found" });
    }

    inMemoryBooks[index] = {
      id: bookId,
      title: title.trim(),
      author: author.trim(),
      price,
      pages,
    };
    return response.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

// DELETE /books/:bookId/ : Remove a book by ID
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const bookId = parseId(request.params.bookId);
    if (bookId === null) {
      return response
        .status(400)
        .json({ message: "bookId must be a positive whole number" });
    }

    if (db) {
      const result = await db.run("DELETE FROM book WHERE id = ?;", [bookId]);

      if (result.changes === 0) {
        return response.status(404).json({ message: "Book not found" });
      }

      return response.status(200).json({ message: "Book deleted successfully" });
    }

    const index = inMemoryBooks.findIndex((b) => b.id === bookId);
    if (index === -1) {
      return response.status(404).json({ message: "Book not found" });
    }

    inMemoryBooks = inMemoryBooks.filter((b) => b.id !== bookId);
    return response.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

// ---------- Fallback Handlers ----------

// Unknown URL (404)
app.use((request, response) => {
  response.status(404).json({ message: "Route not found" });
});

// Error-handling middleware: catches bad JSON bodies
app.use((error, request, response, next) => {
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ message: "Invalid JSON in request body" });
  }
  response.status(500).json({ message: error.message });
});

initializeDBAndServer();

module.exports = app;
