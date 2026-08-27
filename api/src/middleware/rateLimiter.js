import rateLimit from "express-rate-limit";

// General rate limiter for all requests
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests. Please try again later.",
  },
});

// Rate limiter for login attempts
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many login attempts. Please try again later.",
  },
});

// Rate limiter for password reset request tokens
export const PWRateLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many password reset requests. Please try again later.",
  },
});
