import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validate, validateEmail } from "../helpers/validators.js";
import { pool } from "../config/db.js";

export const login = async (req, res) => {
  const validationResult = validate("login", req);
  if (validationResult) {
    return res.status(validationResult.statusCode).json(validationResult);
  }

  const { email, password } = req.body;

  const normalizedEmail = validateEmail(email);
  const client = await pool.connect();
  try {
    const userResult = await client.query(
      `
        SELECT id, first_name, last_name, email, password_hash, is_email_verified
        FROM public.users
        WHERE email = $1;
      `,
      [normalizedEmail],
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid credentials. Please check your email and password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid credentials. Please check your email and password.",
      });
    }

    if (!user.is_email_verified) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Please verify your email before logging in.",
      });
    }

    // todo: implement stay signed in option in future
    // todo: implement refresh token in future

    // generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email }, // payload
      process.env.JWT_SECRET, // secret key
      { expiresIn: "1h" }, // expiration time
    );

    // update last_login_at in db
    await client.query(
      `
        UPDATE public.users
        SET last_login_at = NOW()
        WHERE id = $1;
      `,
      [user.id],
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Login successful.",
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.error("ERROR: ", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to login.",
    });
  } finally {
    client.release();
  }
};
