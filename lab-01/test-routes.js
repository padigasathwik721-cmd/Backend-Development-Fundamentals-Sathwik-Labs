/**
 * Lab 1 - Task 7 Verification Script
 * Sends HTTP requests to all routes and logs the status codes and responses.
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

const routesToTest = [
  { path: '/', expectedStatus: 200, description: 'Welcome Text Route' },
  { path: '/about', expectedStatus: 200, description: 'About JSON Route' },
  { path: '/time', expectedStatus: 200, description: 'Current Time Route' },
  { path: '/unknown-route-test', expectedStatus: 404, description: 'Unknown Path (404 Test)' }
];

function testRoute(route) {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: route.path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          path: route.path,
          expectedStatus: route.expectedStatus,
          actualStatus: res.statusCode,
          passed: res.statusCode === route.expectedStatus,
          contentType: res.headers['content-type'],
          body: data.trim()
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path: route.path,
        expectedStatus: route.expectedStatus,
        actualStatus: 'ERROR',
        passed: false,
        error: err.message
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`Running Route Verification Tests against http://${HOST}:${PORT}`);
  console.log(`======================================================\n`);

  for (const route of routesToTest) {
    const result = await testRoute(route);
    const statusSymbol = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${statusSymbol}] Route: GET ${result.path}`);
    console.log(`   Status Code: ${result.actualStatus} (Expected: ${result.expectedStatus})`);
    if (result.body) {
      console.log(`   Response Body: ${result.body}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log(`------------------------------------------------------`);
  }

  console.log(`\nAll route checks completed.\n`);
}

runTests();

