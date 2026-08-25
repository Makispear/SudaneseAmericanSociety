import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
});

export const sendVerificationEmail = async ({ to, verificationToken }) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const command = new SendEmailCommand({
    Source: process.env.EMAIL_FROM,

    Destination: {
      ToAddresses: [to],
    },

    Message: {
      Subject: {
        Data: "Verify your email",
      },

      Body: {
        Html: {
          Data: `
            <h2>Verify your email</h2>

            <h3>
              Welcome to the Sudanese American Society.
            </h3>
            <br>
            <p>
              Please click the button below to verify your email address.
            </p>

            <p>
              <a href="${verificationUrl}">
                Verify my email
              </a>
            </p>

            <p>
              This link will expire in 15 minutes.
            </p>
          `,
        },
      },
    },
  });

  return await sesClient.send(command);
};
