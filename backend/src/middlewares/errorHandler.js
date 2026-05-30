export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      message: err.errors[0].message
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
