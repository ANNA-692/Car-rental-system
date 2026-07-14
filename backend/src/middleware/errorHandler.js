export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({
      status: "error",
      message: "File too large. Maximum size is 10MB.",
    });
    return;
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    res.status(400).json({
      status: "error",
      message: "Unexpected file field.",
    });
    return;
  }

  if (err.message && err.message.includes("Only JPEG, PNG, and WebP")) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}

export function notFoundHandler(_req, _res, next) {
  next(new AppError("Resource not found", 404));
}
