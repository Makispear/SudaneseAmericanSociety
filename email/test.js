import { handler } from "./index.js";

const testEvent = {
  version: "0",
  id: "local-test",
  "detail-type": "User Created",
  source: "sudanese-american-society.accounts",
  detail: {
    userId: "1",
    email: "ma.makiofficial@gmail.com",
    verificationToken: "test-token-123",
  },
};

await handler(testEvent);
