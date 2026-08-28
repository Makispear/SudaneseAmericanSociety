import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  saveRefreshToken,
  findRefreshToken,
  getRefreshTokenExpiration,
  rotateRefreshToken,
  getRefreshTokenMaxAge,
  revokeRefreshToken,
} from "../services/tokenService.js";
import {
  validate,
  validateEmail,
  validatePassword,
} from "../helpers/validators.js";
import {
  generateVerificationToken,
  hashVerificationToken,
} from "../Utils/emailVerification.js";
import { pool } from "../config/db.js";
import { publishUserPasswordResetEvent } from "../services/eventServices.js";

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
      return res.status(200).json({
        success: false,
        statusCode: 200,
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
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = getRefreshTokenExpiration();

    await saveRefreshToken(user.id, refreshTokenHash, expiresAt);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: getRefreshTokenMaxAge(),
    });
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
        accessToken,
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

export const forgotPassword = async (req, res) => {
  const validationResult = validate("forgotPassword", req);

  if (validationResult) {
    return res.status(validationResult.statusCode).json(validationResult);
  }

  const { email } = req.body;
  const normalizedEmail = validateEmail(email);

  const client = await pool.connect();

  try {
    // Find the user
    const userResult = await client.query(
      `
        SELECT id, first_name, last_name, email
        FROM public.users
        WHERE email = $1;
      `,
      [normalizedEmail],
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          "If an account exists for this email, password reset instructions have been sent.",
      });
    }

    // Check if the user already has an active reset token
    const existingTokenResult = await client.query(
      `
        SELECT id, expires_at
        FROM password_reset_tokens
        WHERE user_id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1;
      `,
      [user.id],
    );

    const existingToken = existingTokenResult.rows[0];

    // Don't send another reset email while the current token is active
    if (existingToken) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          "If an account exists for this email, password reset instructions have been sent.",
      });
    }

    // Generate a new reset token
    const resetToken = generateVerificationToken();
    const tokenHash = hashVerificationToken(resetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Store the hashed token
    await client.query(
      `
        INSERT INTO password_reset_tokens
        (user_id, token_hash, expires_at)
        VALUES ($1, $2, $3)
      `,
      [user.id, tokenHash, expiresAt],
    );

    // Send reset email through EventBridge
    await publishUserPasswordResetEvent({
      userId: user.id,
      email: user.email,
      firstName: user.first_name,
      resetToken,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "If an account exists for this email, password reset instructions have been sent.",
    });
  } catch (error) {
    console.error("ERROR: ", error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to request password reset.",
    });
  } finally {
    client.release();
  }
};

export const changePassword = async (req, res) => {
  const validationResult = validate("changePassword", req);

  if (validationResult) {
    return res.status(validationResult.statusCode).json(validationResult);
  }

  const { oldPassword, newPassword } = req.body;
  const userId = req.user.sub;

  const client = await pool.connect();

  try {
    const userResult = await client.query(
      `
        SELECT id, password_hash
        FROM public.users
        WHERE id = $1
      `,
      [userId],
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found.",
      });
    }

    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password_hash,
    );

    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Current password is incorrect.",
      });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password_hash,
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "New password cannot be the same as your current password.",
      });
    }

    const validatedPassword = validatePassword(newPassword);
    const newPasswordHash = await bcrypt.hash(validatedPassword, 12);

    // Start transaction
    await client.query("BEGIN");

    const updatedResult = await client.query(
      `
        UPDATE public.users
        SET password_hash = $1,
            updated_at = NOW()
        WHERE id = $2
      `,
      [newPasswordHash, userId],
    );

    if (updatedResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found.",
      });
    }

    // Revoke all existing refresh tokens
    await client.query(
      `
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE user_id = $1
          AND revoked_at IS NULL
      `,
      [userId],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Password changed successfully.",
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("ROLLBACK ERROR:", rollbackError);
    }

    console.error("ERROR:", error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to change password.",
    });
  } finally {
    client.release();
  }
};

export const resetPassword = async (req, res) => {
  const validationResult = validate("resetPassword", req);
  if (validationResult) {
    return res.status(validationResult.statusCode).json(validationResult);
  }
  const { resetToken, newPassword } = req.body;
  const tokenHash = hashVerificationToken(resetToken);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tokenResult = await client.query(
      `
        SELECT id, user_id, expires_at, used_at
        FROM password_reset_tokens
        WHERE token_hash = $1
          AND used_at IS NULL
          AND expires_at > NOW()
        LIMIT 1;
      `,
      [tokenHash],
    );

    if (tokenResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid or expired password reset link.",
      });
    }

    const resetTokenRecord = tokenResult.rows[0];

    const validatedPassword = validatePassword(newPassword);

    const newPasswordHash = await bcrypt.hash(validatedPassword, 12);

    const updateResult = await client.query(
      `
        UPDATE public.users
        SET password_hash = $1,
            updated_at = NOW()
        WHERE id = $2
      `,
      [newPasswordHash, resetTokenRecord.user_id],
    );

    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found.",
      });
    }

    const updateTokenResult = await client.query(
      `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE id = $1
          AND used_at IS NULL
      `,
      [resetTokenRecord.id],
    );

    if (updateTokenResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Failed to mark the reset token as used.",
      });
    }

    await client.query(
      `
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE user_id = $1
          AND revoked_at IS NULL
      `,
      [resetTokenRecord.user_id],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Password reset successfully.",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("ERROR: ", error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to reset password.",
    });
  } finally {
    client.release();
  }
};

// Refresh token endpoint
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Refresh token is required.",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid refresh token.",
      });
    }

    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await findRefreshToken(tokenHash);

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid refresh token.",
      });
    }

    if (storedToken.revoked_at) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Refresh token has been revoked.",
      });
    }

    if (new Date(storedToken.expires_at) <= new Date()) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Refresh token has expired.",
      });
    }

    const accessToken = generateAccessToken(storedToken.user_id);

    const newRefreshToken = generateRefreshToken(storedToken.user_id);

    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    const newExpiresAt = getRefreshTokenExpiration();

    await rotateRefreshToken(
      storedToken.id,
      storedToken.user_id,
      newRefreshTokenHash,
      newExpiresAt,
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: getRefreshTokenMaxAge(),
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Access token refreshed successfully.",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error("ERROR: ", error);

    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid or expired refresh token.",
    });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const tokenHash = hashRefreshToken(refreshToken);
      const storedToken = await findRefreshToken(tokenHash);

      if (storedToken && !storedToken.revoked_at) {
        await revokeRefreshToken(storedToken.id);
      }
    } catch (error) {
      console.error("ERROR:", error);
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Logged out successfully.",
  });
};
