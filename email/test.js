import { handler } from "./index.js";

const testEvent = {
  version: "0",
  id: "local-test",
  "detail-type": "EmailVerificationRequested",
  source: "sudanese-american-society.accounts",
  detail: {
    userId: "1",
    email: "ma.makiofficial@gmail.com",
    verificationToken: "test-token-123",
  },
};

const testEvent2 = {
  version: "0",
  id: "local-test",
  "detail-type": "PasswordResetRequested",
  source: "sudanese-american-society.api",
  detail: {
    userId: "1",
    email: "ma.makiofficial@gmail.com",
    firstName: "Maki",
    resetToken: "test-reset-token-123",
  },
};

// !change the event to test different scenarios
await handler(testEvent);
// await handler(testEvent2);
