import bcrypt from "bcrypt";
import crypto from "crypto";
import { pool } from "../config/db.js";
import { sendVerificationEmail as sendEmail } from "../services/emailService.js";

import {
  createAccountQuery,
  addDependants,
} from "../helpers/SQL/queries/createAccountQuery.js";
import deleteAccountQuery from "../helpers/SQL/queries/deleteAccountQuery.js";
import getAllusersQuery from "../helpers/SQL/queries/getAllUsers.js";
import { validate, validateEmail } from "../helpers/validators.js";
import {
  generateVerificationToken,
  hashVerificationToken,
} from "../Utils/emailVerification.js";
import { createEmailVerificationToken } from "../helpers/SQL/queries/emailVerification.js";

export const getAllUsers = async (req, res) => {
  const client = await pool.connect();
  try {
    const allUsers = await client.query(getAllusersQuery);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Users retrieved successfully.",
      results: allUsers.rows.length,
      data: allUsers.rows,
    });
  } catch (error) {
    console.log("error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      error: "InternalServerError",
      message: "An error occurred while fetching users.",
    });
  }
};

export const createAccount = async (req, res) => {
  const validationResult = validate("createAccount", req.body);
  if (validationResult) {
    return res.status(validationResult.statusCode).json(validationResult);
  }
  const {
    firstName,
    lastName,
    gender,
    email,
    phone,
    password,
    membershipType,
    familyMembers = [],
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);
  const params = [
    firstName,
    lastName,
    gender,
    email,
    phone,
    membershipType,
    hashedPassword,
  ];

  validateEmail(email);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const sql_to_create_user = await client.query(createAccountQuery, params);
    const primaryMemberId = sql_to_create_user.rows[0].id;

    if (membershipType === "Family") {
      for (const {
        childFirstName,
        childLastName,
        childGender,
        childDoB,
        relationship,
      } of familyMembers) {
        const childParams = [
          primaryMemberId,
          childFirstName,
          childLastName,
          childGender,
          childDoB,
          relationship,
        ];
        // todo: validate (one spouse for example, kids age? optional phone or email.)
        // vaidateDependantsList
        const sql_to_create_dependants = await client.query(
          addDependants,
          childParams,
        );
      }
    }
    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Created Account Successfully.",
      results: sql_to_create_user.rows.length,
      data: sql_to_create_user.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("ERROR: ", error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to create account.",
    });
  } finally {
    client.release();
  }
};

export const sendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  console.log("Verification requested for:", email);

  const client = await pool.connect();
  try {
    const get_user_sql = await client.query(
      `
        SELECT id as user_id, email, is_email_verified
        FROM public.users
        WHERE email = $1;
      `,
      [email],
    );

    const userInfo = get_user_sql.rows;

    if (userInfo.length === 0) {
      console.log("No user with this email found!");
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          "If an account exists with this email, a verification email has been sent.",
      });
    }

    const user = userInfo[0];
    if (user["is_email_verified"] === true) {
      console.log("Email is already verified.");
      return res.status(400).json({
        success: true,
        statusCode: 400,
        message: "Email is already verified.",
      });
    }

    const verificationTokenResult = await client.query(
      `
        SELECT user_id, expires_at
        FROM public.email_verification_tokens
        WHERE user_id = $1
        order by created_at desc
        LIMIT 1;
      `,
      [user.user_id],
    );
    if (verificationTokenResult.rows.length > 0) {
      const token = verificationTokenResult.rows[0];

      const ExpiresAt = new Date(token.expires_at);
      const now = new Date();

      if (ExpiresAt > now) {
        const millisecondsRemaining = ExpiresAt - now;
        const minutesRemaining = Math.ceil(millisecondsRemaining / (1000 * 60));
        console.log(
          `Can't send verification email. User must wait ${minutesRemaining} minute(s).`,
        );

        const minuteOrMinutes = minutesRemaining > 1 ? " minutes" : "minute";
        return res.status(429).json({
          success: false,
          statusCode: 429,
          message: `Please wait ${minutesRemaining} ${minuteOrMinutes} before requesting another verification email.`,
        });
      }
    }

    console.log("User requires email verification:", user.user_id);
    const emailVerificationToken = generateVerificationToken();
    const tokenHash = hashVerificationToken(emailVerificationToken);

    const tokenResult = await client.query(createEmailVerificationToken, [
      user.user_id,
      tokenHash,
    ]);

    console.log("Verification token saved. Token ID:", tokenResult.rows[0].id);
    await sendEmail({
      to: user.email,
      verificationToken: emailVerificationToken,
    });
    console.log("Verification email sent successfully.");

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "If an account exists with this email, a verification email has been sent.",
    });
    //
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to process verification request.",
    });
  } finally {
    client.release();
  }
};

export const deleteAccount = async (req, res) => {
  const validationResult = validate("deleteAccount", req);
  if (validationResult) {
    return res.status(validationResult.statusCode).json(validationResult);
  }

  const { public_id } = req.body;
  const params = [public_id];

  const result = pool.query(deleteAccountQuery, params);
};

// todo:
// 2. when deleting make sure to delete the member after? expiration. Mark deleted?
