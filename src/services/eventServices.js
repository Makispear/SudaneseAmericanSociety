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
  console.log("EVENTBRIDGE RESULT:", JSON.stringify(eventResult, null, 2));
  const command = new PutEventsCommand({
    Entries: [
      {
        Source: "sudanese-american-society.accounts",
        DetailType: "User Created",
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
