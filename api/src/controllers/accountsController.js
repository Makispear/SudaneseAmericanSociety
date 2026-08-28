import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

import {
  publishUserCreatedEvent,
  publishVerificationEmailRequestedEvent,
} from "../services/eventServices.js";
import { validate, validateEmail } from "../helpers/validators.js";
import {
  generateVerificationToken,
  hashVerificationToken,
} from "../Utils/emailVerification.js";

export const getAllUsers = async (req, res) => {
  const client = await pool.connect();
  try {
    const getAllusersQuery = `
      SELECT
      public_id,
      CONCAT(first_name, ' ', last_name) as full_name 
      FROM users;
    `;
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

  const normalizedEmail = validateEmail(email);
  const hashedPassword = await bcrypt.hash(password, 12);
  const params = [
    firstName,
    lastName,
    gender,
    normalizedEmail,
    phone,
    membershipType,
    hashedPassword,
  ];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const createAccountQuery = `
      insert into public.users (first_name, last_name, gender, email, phone, membership_type, password_hash)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning id, CONCAT(first_name, ' ', last_name) AS full_name, created_at;
    `;
    const sql_to_create_user = await client.query(createAccountQuery, params);
    const primaryMemberId = sql_to_create_user.rows[0].id;
    const verificationToken = generateVerificationToken();
    const tokenHash = hashVerificationToken(verificationToken);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await client.query(
      `INSERT INTO email_verification_tokens
    (user_id, token_hash, expires_at)
   VALUES ($1, $2, $3)`,
      [primaryMemberId, tokenHash, expiresAt],
    );

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
        const addDependants = `
          insert into public.dependants (primary_member_id, first_name, last_name, gender, dob, relationship)
          values ($1, $2, $3, $4, $5, $6);
        `;
        const sql_to_create_dependants = await client.query(
          addDependants,
          childParams,
        );
      }
    }
    await client.query("COMMIT");
    // todo: what if the publish failed?
    await publishUserCreatedEvent({
      userId: primaryMemberId,
      email: normalizedEmail,
      verificationToken,
    });
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

    const createEmailVerificationToken = `
      INSERT INTO public.email_verification_tokens
      (user_id, token_hash, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '15 minutes')
      RETURNING id, expires_at;
    `;
    const tokenResult = await client.query(createEmailVerificationToken, [
      user.user_id,
      tokenHash,
    ]);

    console.log("Verification token saved. Token ID:", tokenResult.rows[0].id);
    await publishVerificationEmailRequestedEvent({
      userId: user.user_id,
      email: user.email,
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

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  console.log("Email verification requested.");

  if (!token) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Verification token is required.",
    });
  }
  const now = new Date();

  console.log("Verification token received.");
  const tokenHash = hashVerificationToken(token);

  const client = await pool.connect();

  try {
    const tokenResult = await client.query(
      `
        SELECT id, user_id, expires_at
        FROM public.email_verification_tokens
        WHERE token_hash = $1
          AND used_at IS NULL
        LIMIT 1;
      `,
      [tokenHash],
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid or expired verification link.",
      });
    }

    const verificationToken = tokenResult.rows[0];

    console.log("Verification token found. Token ID:", verificationToken.id);
    const expiresAt = new Date(verificationToken.expires_at);

    if (expiresAt <= now) {
      console.log(
        "Verification token expired. Token ID:",
        verificationToken.id,
      );

      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid or expired verification link.",
      });
    }
    const updateUserResult = await client.query(
      `
    UPDATE public.users
    SET is_email_verified = true
    WHERE id = $1
    RETURNING id, email, is_email_verified;
  `,
      [verificationToken.user_id],
    );

    if (updateUserResult.rows.length === 0) {
      console.log(
        "No user found for verification token. Token ID:",
        verificationToken.id,
      );

      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid or expired verification link.",
      });
    }

    const verifiedUser = updateUserResult.rows[0];

    console.log("Email successfully verified for user:", verifiedUser.id);
    await client.query(
      `
    UPDATE public.email_verification_tokens
    SET used_at = NOW()
    WHERE id = $1;
  `,
      [verificationToken.id],
    );

    console.log(
      "Verification token marked as used. Token ID:",
      verificationToken.id,
    );
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to verify email.",
    });
  } finally {
    client.release();
  }
};

// todo:
// 2. when deleting make sure to delete the member after? expiration. Mark deleted?
