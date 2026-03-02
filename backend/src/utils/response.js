export const sendSuccess = (res, data, message = "OK", statusCode = 200) =>
  res.status(statusCode).json({ message, data });
