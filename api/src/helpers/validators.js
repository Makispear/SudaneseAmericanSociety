import validator from "validator";

const { isEmail, normalizeEmail } = validator;
const validate = (apiName, req) => {
  if (apiName == "createAccount") {
    const {
      firstName,
      lastName,
      gender,
      email,
      phone,
      membershipType,
      password,
      familyMembers = [],
    } = req;
    if (
      !firstName ||
      !lastName ||
      !gender ||
      !email ||
      !phone ||
      !membershipType ||
      !password
    ) {
      return {
        success: false,
        statusCode: 400,
        error: "ValidationError",
        message:
          "Missing required fields. First name, last name, email, phone, password, and membership type are required.",
      };
    }

    if (membershipType === "Family" && familyMembers.length < 1) {
      return {
        success: false,
        statusCode: 400,
        error: "ValidationError",
        message:
          "family members list cannot be empty when selecting family membership type. Provide at least one family member or switch to individual memebership.",
      };
    } else if (membershipType === "Family" && familyMembers.length > 0) {
      //  todo :
      // check if there's more than one spouse.
      // we don't care if they're married.
      // check if there's the same person twice (2 ahmed's as children)
      // check if there's more than 6 children
      // how can I made sure that ther're not adding random people to this?
      // how do I make sure that their not adding a second spouse as a child?
      // other cases?
    }
    return null;
  }
  if (apiName == "login") {
    const { email, password } = req.body;
    if (!email || !password) {
      return {
        success: false,
        statusCode: 400,
        error: "ValidationError",
        message: "Missing required fields. Email and password are required.",
      };
    }
  }
  if (apiName == "forgotPassword") {
    const { email } = req.body;
    if (!email) {
      return {
        success: false,
        statusCode: 400,
        error: "ValidationError",
        message: "Missing required field. Email is required.",
      };
    }
  }

  if (apiName == "changePassword") {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return {
        success: false,
        statusCode: 400,
        error: "ValidationError",
        message:
          "Missing required fields. Old password and new password are required.",
      };
    }
  }
  if (apiName == "resetPassword") {
    const { resetToken, newPassword } = req.body;
    if (!newPassword || !resetToken) {
      return {
        success: false,
        statusCode: 400,
        error: "ValidationError",
        message:
          "Missing required fields. newPassword and resetToken are required.",
      };
    }
  }
};

const validateEmail = (rawEmail) => {
  if (typeof rawEmail !== "string") {
    throw new Error("Invalid input: Email must be a string");
  }
  const trimmed = rawEmail.trim();

  if (!isEmail(trimmed)) {
    throw new Error("Invalid email format");
  }
  const normalizedEmail = normalizeEmail(trimmed, {
    all_lowercase: true,
    gmail_lowercase: true,
    gmail_remove_dots: false, // Set to false if you want to preserve user dot preferences
    gmail_remove_subaddress: true, // Strips +tag from Gmail addresses
    outlook_lowercase: true,
    outlook_remove_subaddress: true,
    yahoo_lowercase: true,
    yahoo_remove_subaddress: true,
    icloud_lowercase: true,
    icloud_remove_subaddress: true,
  });

  return normalizedEmail;
};

const validatePassword = (password, user) => {
  if (typeof password !== "string") {
    throw new Error("Invalid input: Password must be a string");
  }

  password = password.trim();

  // can't contain first or last name
  if (user) {
    if (
      password.includes(user.first_name) ||
      password.includes(user.last_name)
    ) {
      throw new Error("Password cannot contain your first or last name");
    }
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  if (password.length > 128) {
    throw new Error("Password must not exceed 128 characters");
  }

  // Check for at least one uppercase letter, one lowercase letter, one number, and one special character
  if (!/[A-Z]/.test(password)) {
    throw new Error("Password must contain at least one uppercase letter");
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    throw new Error("Password must contain at least one lowercase letter");
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    throw new Error("Password must contain at least one number");
  }

  // Check for at least one special character
  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new Error("Password must contain at least one special character");
  }

  return password;
};

export { validate, validateEmail, validatePassword };
