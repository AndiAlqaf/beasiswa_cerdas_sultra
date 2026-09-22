/**
 * Request ID Middleware
 * 
 * Assigns a unique UUID to every request for tracing and debugging.
 * The ID is available in req.requestId and response header X-Request-ID.
 */

const { v4: uuidv4 } = require('uuid');

function requestId(req, res, next) {
  const id = req.headers['x-request-id'] || uuidv4();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}

module.exports = { requestId };
