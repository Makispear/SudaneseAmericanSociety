const validate = (call, req) => {
  if (call == "createAccount") {
    const {
      step,
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
    if (!firstName || !lastName || !email || !phone || !membershipType) {
      return res.status(400).json;
    }
  }
};

module.exports = {
  validate,
};
