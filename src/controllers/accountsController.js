import { pool } from "../config/db.js";
import validate from "../helpers/validators.js";

export const getAllUsers = async (req, res) => {
  const allUsers = await pool.query(`
  SELECT CONCAT(first_name, ' ', last_name) as full_name FROM users;
  `);
  try {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Users retrieved successfully.",
      results: allUsers.rows.length,
      data: allUsers.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      error: "InternalServerError",
      message: "An error occurred while fetching users.",
    });
  }
};

export const createAccount = (req, res) => {
  // const error = validate("createAccount", req.body);
  // if (error) {
  //   return error;
  // }

  const {
    firstName,
    lastName,
    gender,
    email,
    phone,
    membershipType,
    familyMembers = [],
    billingCycle,
    paymentMethodId,
  } = req.body;

  for (const {
    childFirstName,
    childLastName,
    birthYear,
    childGender,
  } of familyMembers) {
  }

  if (!firstName || !lastName || !email || !phone || !membershipType) {
    return res.status(400).json;
  }

  if (membershipType === "family" && familyMembers.length < 1) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      error: "ValidationError",
      message:
        "The family members list cannot be empty when selecting family membership type. Provide at least one familty member.",
      field: "familyMembers",
    });
  }
};
