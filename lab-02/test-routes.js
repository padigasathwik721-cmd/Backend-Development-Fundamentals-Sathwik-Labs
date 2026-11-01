/**
 * Lab 2 - Automated Route Verification Script
 * Probes all CRUD endpoints and asserts expected HTTP status codes.
 * 
 * Student: Padiga Sathwik (252U1R1172) - CSE-2D
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

function request(method, path, body = null) {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : '';
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data.trim()
        });
      });
    });

    req.on('error', (err) => {
      resolve({ statusCode: 'ERROR', error: err.message });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`Running Lab 2 CRUD Route Tests against http://${HOST}:${PORT}`);
  console.log(`======================================================\n`);

  // Test 1: GET /books/
  let res = await request('GET', '/books/');
  console.log(`[${res.statusCode === 200 ? '✅ PASS' : '❌ FAIL'}] GET /books/ - Status: ${res.statusCode} (Expected: 200)`);

  // Test 2: GET /books/1/
  res = await request('GET', '/books/1/');
  console.log(`[${res.statusCode === 200 ? '✅ PASS' : '❌ FAIL'}] GET /books/1/ - Status: ${res.statusCode} (Expected: 200)`);

  // Test 3: POST /books/
  res = await request('POST', '/books/', {
    title: 'Eloquent JavaScript',
    author: 'Marijn Haverbeke',
    price: 550,
    pages: 472
  });
  console.log(`[${res.statusCode === 201 ? '✅ PASS' : '❌ FAIL'}] POST /books/ - Status: ${res.statusCode} (Expected: 201)`);

  // Test 4: PUT /books/1/
  res = await request('PUT', '/books/1/', {
    title: 'Clean Code: Revised Edition',
    author: 'Robert C. Martin',
    price: 699,
    pages: 464
  });
  console.log(`[${res.statusCode === 200 ? '✅ PASS' : '❌ FAIL'}] PUT /books/1/ - Status: ${res.statusCode} (Expected: 200)`);

  // Test 5: DELETE /books/11/
  res = await request('DELETE', '/books/11/');
  console.log(`[${res.statusCode === 200 ? '✅ PASS' : '❌ FAIL'}] DELETE /books/11/ - Status: ${res.statusCode} (Expected: 200)`);

  // Test 6: GET /books/999/ (404 Not Found)
  res = await request('GET', '/books/999/');
  console.log(`[${res.statusCode === 404 ? '✅ PASS' : '❌ FAIL'}] GET /books/999/ - Status: ${res.statusCode} (Expected: 404)`);

  console.log(`\nAll Lab 2 tests executed.\n`);
}

runTests();
