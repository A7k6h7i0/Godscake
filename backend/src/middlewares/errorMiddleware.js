export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const payload = {
    message: err.message || "Internal Server Error",
  };

  if (err.details) payload.details = err.details;
  if (process.env.NODE_ENV !== "production" && err.stack) payload.stack = err.stack;

  res.status(status).json(payload);
};
