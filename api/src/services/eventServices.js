import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const eventBridgeClient = new EventBridgeClient({
  region: process.env.AWS_REGION,
});

export const publishUserCreatedEvent = async ({
  userId,
  email,
  verificationToken,
}) => {
  const command = new PutEventsCommand({
    Entries: [
      {
        Source: "sudanese-american-society.accounts",
        DetailType: "EmailVerificationRequested",
        Detail: JSON.stringify({
          userId,
          email,
          verificationToken,
        }),
      },
    ],
  });

  return await eventBridgeClient.send(command);
};

export const publishVerificationEmailRequestedEvent = async ({
  userId,
  email,
  verificationToken,
}) => {
  const command = new PutEventsCommand({
    Entries: [
      {
        Source: "sudanese-american-society.accounts",
        DetailType: "Verification Email Requested",
        Detail: JSON.stringify({
          userId,
          email,
          verificationToken,
        }),
      },
    ],
  });

  return await eventBridgeClient.send(command);
};

export const publishUserPasswordResetEvent = async ({
  userId,
  email,
  firstName,
  resetToken,
}) => {
  const command = new PutEventsCommand({
    Entries: [
      {
        Source: "sudanese-american-society.api",
        DetailType: "PasswordResetRequested",
        Detail: JSON.stringify({
          userId,
          email,
          firstName,
          resetToken,
        }),
      },
    ],
  });

  return await eventBridgeClient.send(command);
};
