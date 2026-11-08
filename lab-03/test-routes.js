/**
 * Lab 3 - Automated Test Suite
 * Tests query parameters, search, sort, price filters, body validation, and error codes.
 * 
 * Student: Padiga Sathwik (252U1R1172) - CSE-2D
 * Faculty: Mr Sai siva teja
 */

const http = require("http");

const PORT = process.env.PORT || 3000;
const HOST = "localhost";

function request(method, path, body = null) {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : "";
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data.trim(),
        });
      });
    });

    req.on("error", (err) => {
      resolve({ statusCode: "ERROR", error: err.message });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`Running Lab 3 REST API Tests against http://${HOST}:${PORT}`);
  console.log(`Student: Padiga Sathwik | Faculty: Mr Sai siva teja`);
  console.log(`======================================================\n`);

  const tests = [
    { desc: "GET all books (200 OK)", method: "GET", path: "/books/", expected: 200 },
    { desc: "Search title 'the' (200 OK)", method: "GET", path: "/books/?search_q=the", expected: 200 },
    { desc: "Sort by price DESC (200 OK)", method: "GET", path: "/books/?order_by=price&order=DESC", expected: 200 },
    { desc: "Price filter 300 to 450 (200 OK)", method: "GET", path: "/books/?min_price=300&max_price=450", expected: 200 },
    { desc: "Pagination limit=3 offset=3 (200 OK)", method: "GET", path: "/books/?limit=3&offset=3", expected: 200 },
    { desc: "GET book by ID 1 (200 OK)", method: "GET", path: "/books/1/", expected: 200 },
    { desc: "Invalid bookId string (400 Bad Request)", method: "GET", path: "/books/abc/", expected: 400 },
    { desc: "Invalid order_by column (400 Bad Request)", method: "GET", path: "/books/?order_by=rating", expected: 400 },
    { desc: "Invalid order direction (400 Bad Request)", method: "GET", path: "/books/?order=DOWN", expected: 400 },
    { desc: "Invalid limit negative (400 Bad Request)", method: "GET", path: "/books/?limit=-5", expected: 400 },
    { desc: "Invalid price range min > max (400 Bad Request)", method: "GET", path: "/books/?min_price=500&max_price=200", expected: 400 },
    { desc: "POST missing title (400 Bad Request)", method: "POST", path: "/books/", body: { author: "John", price: 350 }, expected: 400 },
    { desc: "POST non-numeric price (400 Bad Request)", method: "POST", path: "/books/", body: { title: "Python", author: "John", price: "free" }, expected: 400 },
    { desc: "POST valid book (201 Created)", method: "POST", path: "/books/", body: { title: "Python Basics", author: "John", price: 350, pages: 250 }, expected: 201 },
    { desc: "PUT valid update (200 OK)", method: "PUT", path: "/books/1/", body: { title: "Updated Book", author: "Author", price: 500, pages: 300 }, expected: 200 },
    { desc: "PUT non-existent book (404 Not Found)", method: "PUT", path: "/books/999/", body: { title: "Ghost", author: "Ghost", price: 100 }, expected: 404 },
    { desc: "DELETE non-existent book (404 Not Found)", method: "DELETE", path: "/books/999/", expected: 404 },
    { desc: "GET missing book 999 (404 Not Found)", method: "GET", path: "/books/999/", expected: 404 },
    { desc: "GET unknown route (404 Not Found)", method: "GET", path: "/nothing", expected: 404 },
    { desc: "SQL injection safe test (200 OK)", method: "GET", path: "/books/?search_q=';DROP%20TABLE%20book;--", expected: 200 }
  ];

  let passed = 0;
  for (const t of tests) {
    const res = await request(t.method, t.path, t.body);
    const isPass = res.statusCode === t.expected;
    if (isPass) passed++;
    console.log(`[${isPass ? "✅ PASS" : "❌ FAIL"}] ${t.desc} -> Status: ${res.statusCode} (Expected: ${t.expected})`);
  }

  console.log(`\nResults: ${passed} / ${tests.length} tests passed.\n`);
}

runTests();
