/**
 * Lab 1 - Task 3: Plain Node.js HTTP Server
 * Built using Node.js built-in 'http' module.
 * Listens on port 3000 and responds with "Hello".
 */

const http = require('http');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`[HTTP Server] Received request: ${req.method} ${req.url}`);

  // Set HTTP response status code to 200 (OK)
  res.statusCode = 200;

  // Set content type header to plain text
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  // Send response body and finish the request
  res.end('Hello\n');
});

// Start listening for incoming connections
server.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`Plain HTTP Server running on:`);
  console.log(`http://localhost:${PORT}/`);
  console.log(`Press Ctrl+C to stop the server.`);
  console.log(`========================================`);
});

