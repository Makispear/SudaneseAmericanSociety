import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import {
  createAccountQuery,
  addDependants,
} from "../helpers/SQL/queries/createAccountQuery.js";
import deleteAccountQuery from "../helpers/SQL/queries/deleteAccountQuery.js";
import getAllusersQuery from "../helpers/SQL/queries/getAllUsers.js";
import { validate } from "../helpers/validators.js";

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await pool.query(getAllusersQuery);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Users retrieved successfully.",
      results: allUsers.rows.length,
      data: allUsers.rows,
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

  const sql_to_create_user = await pool.query(createAccountQuery, params);

  const primaryMemberId = sql_to_create_user.rows[0].id;
  const childParams = [];
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
      await pool.query(addDependants, childParams);
    }
  }
  // const sql_to_create_dependants = await pool.query(addDependants, childParams);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Created Account Successfully.",
    results: sql_to_create_user.rows.length,
    data: sql_to_create_user.rows,
  });
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
// 1. make sure to create a members table. Children need to be added.
// 2. when deleting make sure to delete the member after? expiration. Mark deleted?
// 3. validate params (generic)
// 4.
