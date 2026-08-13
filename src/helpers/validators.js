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
    }
    else if (membershipType === "Family" && familyMembers.length > 0) {
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

module.exports = {
  validate,
};
