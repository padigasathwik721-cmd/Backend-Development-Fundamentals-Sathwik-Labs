# Lab 3: REST API, query parameters, validation, debugging

**Subject:** Backend Development Fundamentals  
**Year/Term:** Year II, Term II  
**University:** Aurora Deemed to be University  
**Faculty:** Mr Sai siva teja  
**Repository Link:** [https://github.com/padigasathwik721-cmd/Backend-Development-Fundamentals-Sathwik-Labs](https://github.com/padigasathwik721-cmd/Backend-Development-Fundamentals-Sathwik-Labs)

| Student detail | Value |
| --- | --- |
| Name | Padiga Sathwik |
| Registration number | 252U1R1172 |
| Section | CSE-2D |

---

## Live Link

**Not applicable (Local development server / Cloud IDE)**

> If deploying to Vercel or Render, paste your deployed live URL here: `https://your-service.vercel.app`

---

## Project Overview

This lab turns the Lab 2 book routes into a clean REST API built with Node.js, Express.js and SQLite. Endpoint names are nouns (`/books`) and the HTTP method shows the action. The `GET /books/` route supports search, sorting, price-range filtering and pagination through query parameters. The create and update routes validate the request body, and every response uses the correct HTTP status code and a consistent JSON format.

---

## Technologies Used

- **Node.js**
- **Express.js**
- **SQLite** (`sqlite3` and `sqlite` packages)
- **Nodemon** (development auto-restart)
- **VS Code REST Client** and **Postman** (testing)

---

## Project Structure

```text
lab-03/
├── .env.example
├── .gitignore
├── README.md
├── app.http
├── app.js
├── goodreads.db
├── index.js
├── package.json
├── test-routes.js
├── vercel.json
└── screenshots/
```

`node_modules/` is created by `npm install` and is excluded from Git via `.gitignore`.

---

## How to Run

**Prerequisites:** Node.js (v18+) and npm installed.

1. Open a terminal in the `lab-03` folder:
   ```bash
   cd lab-03
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   For development with auto-restart, use:
   ```bash
   npm run dev
   ```
4. Run automated test suite:
   ```bash
   npm test
   ```

The server runs at `http://localhost:3000`.

**Environment variables (`.env.example`):**

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Port to listen on. Defaults to `3000`. Hosting platforms like Vercel/Render set it automatically. |

On first start, the app automatically creates the `book` table in `goodreads.db` and inserts 10 sample books if the table is empty.

---

## Database Schema

| Column | Type | Description |
| --- | --- | --- |
| `id` | INTEGER | Auto-incrementing primary key |
| `title` | TEXT | Book title |
| `author` | TEXT | Book author |
| `price` | INTEGER | Book price |
| `pages` | INTEGER | Number of pages |

---

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Root welcome message with student and faculty info |
| GET | `/about` | Student and course metadata |
| GET | `/debug-fixes` | Reference of the 4 solved debugging exercise bugs |
| GET | `/books/` | List books with search, filter, sort and pagination |
| GET | `/books/:bookId/` | Get one book by id |
| POST | `/books/` | Add a new book (validated) |
| PUT | `/books/:bookId/` | Update an existing book (validated) |
| DELETE | `/books/:bookId/` | Delete a book |

### Query parameters for `GET /books/`

| Parameter | Default | Description |
| --- | --- | --- |
| `search_q` | empty (matches all) | Partial title match using `LIKE` |
| `order_by` | `id` | Column to sort by: `id`, `title`, `author`, `price` or `pages` |
| `order` | `ASC` | Sort direction: `ASC` or `DESC` |
| `limit` | `10` | Maximum number of books returned |
| `offset` | `0` | Number of books to skip (pagination) |
| `min_price` | `0` | Minimum price (inclusive) |
| `max_price` | no upper limit | Maximum price (inclusive) |

Example:
```
GET /books/?search_q=the&min_price=300&max_price=450&order_by=price&order=DESC&limit=5&offset=0
```

### Request body for `POST /books/` and `PUT /books/:bookId/`

```json
{
  "title": "Python Basics",
  "author": "John",
  "price": 350,
  "pages": 250
}
```

**Validation rules:**
- `title` and `author` are required, non-empty strings.
- `price` is required and must be a non-negative number.
- `pages` is optional, but if provided it must be a positive whole number.

---

## Status Codes and Response Format

| Situation | Status code |
| --- | --- |
| Successful GET, PUT or DELETE | `200 OK` |
| Successful POST | `201 Created` |
| Invalid input (bad body, bad query parameter, bad id) | `400 Bad Request` |
| Book id or route does not exist | `404 Not Found` |
| Unexpected server or database error | `500 Internal Server Error` |

All messages and errors use the same JSON shape:
```json
{ "message": "Book not found" }
```

---

## Security Notes

- All SQL values use parameterized queries (`?` placeholders). User input is never joined into the SQL string.
- `order_by` and `order` cannot use placeholders, so they are checked against allow-lists (`id`, `title`, `author`, `price`, `pages` and `ASC`, `DESC`) before being used.
- A test with `search_q=';DROP TABLE book;--` returns an empty list and the table is unaffected.

---

## Test List (Postman / REST Client)

All requests are also saved in [`app.http`](./app.http).

| # | Request | Expected result |
| --- | --- | --- |
| 1 | `GET /books/` | 200, list of all 10 sample books |
| 2 | `GET /books/?search_q=the` | 200, books matching "the" (case-insensitive) |
| 3 | `GET /books/?order_by=price&order=DESC` | 200, books sorted by price highest to lowest |
| 4 | `GET /books/?order_by=title&order=ASC` | 200, books sorted alphabetically by title |
| 5 | `GET /books/?min_price=300&max_price=450` | 200, books with price between 300 and 450 |
| 6 | `GET /books/?search_q=the&min_price=300&max_price=450&order_by=price&order=DESC&limit=5&offset=0` | 200, combined filters and sorting applied |
| 7 | `GET /books/?limit=3&offset=3` | 200, books 4 to 6 (page 2) |
| 8 | `GET /books/1/` | 200, the book with id 1 |
| 9 | `POST /books/` with valid body | 201, `{"message": "Book added successfully", "bookId": 11}` |
| 10 | `PUT /books/1/` with valid body | 200, `{"message": "Book updated successfully"}` |
| 11 | `DELETE /books/11/` | 200, `{"message": "Book deleted successfully"}` |
| 12 | `GET /books/abc/` | 400, "bookId must be a positive whole number" |
| 13 | `GET /books/?order_by=rating` | 400, "order_by must be one of: id, title, author, price, pages" |
| 14 | `GET /books/?order=DOWN` | 400, "order must be ASC or DESC" |
| 15 | `GET /books/?limit=-5` | 400, "limit must be a positive whole number" |
| 16 | `GET /books/?min_price=500&max_price=200` | 400, "min_price cannot be greater than max_price" |
| 17 | `POST /books/` with missing title | 400, "title is required and must be a non-empty string" |
| 18 | `POST /books/` with non-numeric price | 400, "price is required and must be a non-negative number" |
| 19 | `PUT /books/999/` with a valid body | 404, "Book not found" |
| 20 | `DELETE /books/999/` | 404, "Book not found" |
| 21 | `GET /nothing` | 404, "Route not found" |
| 22 | `GET /books/?search_q=';DROP TABLE book;--` | 200, `[]` and the table is safe |

---

## Screenshots

### 1. Get all books (200 OK)
![GET all books returning 200](./screenshots/Screenshot%202026-11-03%20155003.png)

### 2. Search by title
![Search by title](./screenshots/Screenshot%202026-11-03%20155336.png)

### 3. Sort by price
![Sort by price](./screenshots/Screenshot%202026-11-03%20155346.png)

### 4. Price range filter
![Price range filter with min_price and max_price](./screenshots/Screenshot%202026-11-03%20155355.png)

### 5. Pagination
![Pagination with limit and offset](./screenshots/Screenshot%202026-11-03%20155404.png)

### 6. Get one book by ID
![GET one book by id](./screenshots/Screenshot%202026-11-03%20155413.png)

### 7. Add a book (201 Created)
![POST a valid book returns 201](./screenshots/Screenshot%202026-11-03%20155459.png)

### 8. Update a book (200 OK)
![PUT updates a book and returns 200](./screenshots/Screenshot%202026-11-03%20155510.png)

### 9. Delete a book (200 OK)
![DELETE removes a book and returns 200](./screenshots/Screenshot%202026-11-03%20155540.png)

### 10. Book not found (404 Not Found)
![Missing book returns 404](./screenshots/Screenshot%202026-11-03%20155550.png)

### 11. Invalid ID (400 Bad Request)
![Invalid id returns 400](./screenshots/Screenshot%202026-11-03%20155606.png)

### 12. Invalid sort column (400 Bad Request)
![Invalid order_by returns 400](./screenshots/Screenshot%202026-11-03%20155628.png)

### 13. Invalid limit (400 Bad Request)
![Invalid limit returns 400](./screenshots/Screenshot%202026-11-03%20155641.png)

### 14. Invalid price range (400 Bad Request)
![Invalid price range returns 400](./screenshots/Screenshot%202026-11-03%20155651.png)

### 15. Missing title (400 Bad Request)
![POST without title returns 400](./screenshots/Screenshot%202026-11-03%20155658.png)

### 16. Non-numeric price (400 Bad Request)
![POST with non-numeric price returns 400](./screenshots/Screenshot%202026-11-03%20155711.png)

### 17. Invalid JSON (400 Bad Request)
![POST with broken JSON returns 400](./screenshots/Screenshot%202026-11-03%20155737.png)

### 18. Book not found on update (404 Not Found)
![PUT for a missing book returns 404](./screenshots/Screenshot%202026-11-03%20155754.png)

### 19. Book not found on delete (404 Not Found)
![DELETE for a missing book returns 404](./screenshots/Screenshot%202026-11-03%20155811.png)

### 20. Route not found (404 Not Found)
![Missing route returns 404](./screenshots/Screenshot%202026-11-03%20155817.png)

### 21. SQL injection attempt safe (200 OK)
![SQL injection attempt returns no results](./screenshots/Screenshot%202026-11-03%20155828.png)

---

## Debugging Exercise

| Problem | Error message | Cause | Solution |
| --- | --- | --- | --- |
| Port conflict | `listen EADDRINUSE: address already in use :::3000` | Another server (the Lab 2 app) was already running on port 3000 | Stopped the old server with Ctrl + C (or ended the process with `taskkill /PID <pid> /F`), then restarted. Port can also be changed with the `PORT` variable. |
| Wrong import path | `Cannot find module '...'` | The `require` path pointed to the wrong file or folder | Corrected the relative path (`./` for the same folder, `../` for the parent) and the file name using `path.join(__dirname, 'goodreads.db')`. |
| Table name typo | `SQLITE_ERROR: no such table: ...` | The SQL query used a table name different from the one in `CREATE TABLE` | Changed the query to use the exact table name `book`. |
| Missing `await` | Empty or wrong response, `Promise { <pending> }` | `db.all()` and `db.run()` return Promises and were not awaited | Added `await` and made the route handler function `async`. |

---

## Notes: Problems Faced and How I Solved Them

- **Port already in use:** The server failed to start because the Lab 2 server was still running. I added an error callback to `app.listen` so the message is clear, then stopped the old process.
- **Testing in the terminal:** URLs go in the browser or REST Client / Postman, while the terminal is for commands.
- **Sorting safely:** Column names cannot be passed as `?` parameters, so I used allow-lists for `order_by` and `order` to prevent SQL injection.
- **Consistent errors:** Express returns an HTML page for broken JSON by default. I added an error-handling middleware so even that returns `{ "message": "..." }`.
- **Deployment:** The database file is stored on the temporary disk on serverless/cloud plans, so added books may reset after a restart. The sample data is re-created automatically on startup.

---

## Viva Questions & Conceptual Understanding

### 1. Query parameter vs path parameter?
- **Path Parameter (`/books/:bookId/`):** Identifies a specific individual resource in the hierarchy (e.g. book with id 1). It is mandatory for that route.
- **Query Parameter (`/books/?search_q=the&order=DESC`):** Modifies how a collection of resources is returned (sorting, filtering, pagination). Query parameters are optional.

### 2. What does stateless mean?
- **Statelessness** means every request contains all the information the server needs to fulfill it. The server does not store client session state between requests, which enables easy scaling and reliability.

### 3. Which status code for bad input vs a missing record?
- **Bad input:** `400 Bad Request` (client error in syntax, types, or missing mandatory fields).
- **Missing record:** `404 Not Found` (client request syntax is valid, but the requested resource does not exist in the database).

---

## Rules for All Labs Compliance Checklist
- [x] Never commit or share `.env` file (configured in `.gitignore`).
- [x] Do not commit `node_modules` (configured in `.gitignore`).
- [x] Passwords and credentials never stored or logged in plain text.
- [x] Every route returns the exact HTTP status code (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`).
- [x] Fully parameterized SQL queries (`?` placeholders) prevent SQL injection.
