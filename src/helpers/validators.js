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

export { validate, validateEmail };
