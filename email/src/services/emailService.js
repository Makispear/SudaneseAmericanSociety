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

export const sendPasswordResetEmail = async ({ to, firstName, resetToken }) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const command = new SendEmailCommand({
    Source: process.env.EMAIL_FROM,

    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: "Reset your password",
      },
      Body: {
        Html: {
          Data: `
      <h2>Password Reset Request</h2>

      <p>
        Hello ${firstName},
      </p>

      <p>
        We received a request to reset the password associated with your
        Sudanese American Society account.
      </p>

      <p>
        If you made this request, please click the button below to create
        a new password.
      </p>

      <p>
        <a href="${resetUrl}">
          Reset My Password
        </a>
      </p>

      <p>
        For your security, this link will expire in 15 minutes and can only
        be used once.
      </p>

      <p>
        If you did not request a password reset, you can safely ignore this
        email. Your password will remain unchanged.
      </p>

      <p>
        If you have any concerns about the security of your account, please
        contact the Sudanese American Society.
      </p>

      <p>
        Regards,<br>
        <strong>Sudanese American Society</strong>
      </p>
    `,
        },
      },
    },
  });

  return await sesClient.send(command);
};
