import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../config/db.js";

export const generateAccessToken = (userId) => {
  return jwt.sign(
    {
      sub: userId,
      type: "access",
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    },
  );
};
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      sub: userId,
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    },
  );
};

export const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const saveRefreshToken = async (userId, tokenHash, expiresAt) => {
  const client = await pool.connect();

  try {
    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, expires_at, created_at;
    `;

    const { rows } = await client.query(query, [userId, tokenHash, expiresAt]);

    return rows[0];
  } catch (error) {
    console.error("ERROR: ", error);
    throw error;
  } finally {
    client.release();
  }
};

export const findRefreshToken = async (tokenHash) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT
        id,
        user_id,
        token_hash,
        expires_at,
        revoked_at
      FROM refresh_tokens
      WHERE token_hash = $1;
    `;

    const { rows } = await client.query(query, [tokenHash]);

    return rows[0] || null;
  } catch (error) {
    console.error("ERROR: ", error);
    throw error;
  } finally {
    client.release();
  }
};

export const revokeRefreshToken = async (tokenId) => {
  const client = await pool.connect();

  try {
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE id = $1
      RETURNING id, user_id, revoked_at;
    `;

    const { rows } = await client.query(query, [tokenId]);

    return rows[0] || null;
  } catch (error) {
    console.error("ERROR: ", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getRefreshTokenExpiration = () => {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN;

  if (!expiresIn.endsWith("d")) {
    throw new Error("REFRESH_TOKEN_EXPIRES_IN must be specified in days.");
  }

  const days = Number.parseInt(expiresIn, 10);

  if (!Number.isInteger(days) || days <= 0) {
    throw new Error("Invalid REFRESH_TOKEN_EXPIRES_IN.");
  }

  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

export const rotateRefreshToken = async (
  oldTokenId,
  userId,
  newTokenHash,
  expiresAt,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const revokeQuery = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE id = $1
        AND revoked_at IS NULL;
    `;

    await client.query(revokeQuery, [oldTokenId]);

    const saveQuery = `
      INSERT INTO refresh_tokens (
        user_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3)
      RETURNING id, user_id, expires_at, created_at;
    `;

    const { rows } = await client.query(saveQuery, [
      userId,
      newTokenHash,
      expiresAt,
    ]);

    await client.query("COMMIT");

    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("ERROR: ", error);
    throw error;
  } finally {
    client.release();
  }
};

export const getRefreshTokenMaxAge = () => {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN;

  if (!expiresIn.endsWith("d")) {
    throw new Error("REFRESH_TOKEN_EXPIRES_IN must be specified in days.");
  }

  const days = Number.parseInt(expiresIn, 10);

  if (!Number.isInteger(days) || days <= 0) {
    throw new Error("Invalid REFRESH_TOKEN_EXPIRES_IN.");
  }

  return days * 24 * 60 * 60 * 1000;
};

export const revokeAllRefreshTokensForUser = async (userId) => {
  const client = await pool.connect();

  try {
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = $1
        AND revoked_at IS NULL
      RETURNING id;
    `;

    const { rows } = await client.query(query, [userId]);

    return rows;
  } catch (error) {
    console.error("ERROR:", error);
    throw error;
  } finally {
    client.release();
  }
};
