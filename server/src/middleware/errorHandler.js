export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate entry', details: err.keyValue });
  }
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
}
