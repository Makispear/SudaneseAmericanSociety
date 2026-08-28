import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Authorization token is required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid authorization token.",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid or expired authorization token.",
    });
  }
};
