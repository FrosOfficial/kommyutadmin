const { Pool } = require('pg');

// Create a new pool instance to connect to your database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Netlify Functions handler
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // TODO: Add JWT verification here to get the user's UID
  // For now, we'll get it from the path

  try {
    const path = event.path.replace('/.netlify/functions/index', '') || '/';
    const method = event.httpMethod;

    if (method === 'GET' && path.startsWith('/user/')) {
      const uid = path.split('/')[2];

      if (!uid) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'User UID is required' })
        };
      }

      const { rows } = await pool.query('SELECT * FROM users WHERE uid = $1', [uid]);

      if (rows.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ success: false, error: 'User not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: rows[0] })
      };
    }

    if (method === 'GET' && path === '/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Server is healthy' })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Route not found' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};