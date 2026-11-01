/**
 * Lab 1 - Task 4, 5, 6: Express.js Web Server
 * Backend Development Fundamentals - Year II Term II
 * Faculty: Sai Shiva Teja
 * 
 * Student: Padiga Sathwik
 */

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Parse JSON bodies
app.use(express.json());

// Middleware: Request Logger (logs method, path, and timestamp)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});

/**
 * Task 5 - Route 1: GET /
 * Welcome text route
 */
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Node.js and Express.js Server! (Lab 1)');
});

/**
 * Task 5 - Route 2: GET /about
 * Returns JSON containing student name, registration number, and section
 */
app.get('/about', (req, res) => {
  res.status(200).json({
    name: 'Padiga Sathwik',
    registrationNumber: '[Your Registration Number]',
    section: '[Your Section]',
    course: 'Backend Development Fundamentals',
    lab: 'Lab 1: Node.js and Express server'
  });
});

/**
 * Task 5 - Route 3: GET /time
 * Returns current date and time using new Date()
 */
app.get('/time', (req, res) => {
  const currentDateTime = new Date();
  res.status(200).json({
    currentTime: currentDateTime.toISOString(),
    localeString: currentDateTime.toLocaleString(),
    timestamp: currentDateTime.getTime()
  });
});

/**
 * Task 6: Catch-all 404 handler for any unknown path
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

/**
 * Task 4: Start Express server listening on specified port
 */
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`Express Server is running!`);
  console.log(`Base URL: http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(` - GET  /       -> Welcome message (200 OK)`);
  console.log(` - GET  /about  -> Name & Section JSON (200 OK)`);
  console.log(` - GET  /time   -> Current Date/Time JSON (200 OK)`);
  console.log(` - ANY  /*      -> 404 Not Found`);
  console.log(`=================================================`);
});

module.exports = app;

