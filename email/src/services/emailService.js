import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
});

export const sendVerificationEmail = async ({ to, verificationToken }) => {
  const verificationUrl = `${process.env.API_URL}/api/accounts/verifyEmail?token=${verificationToken}`;

  const command = new SendEmailCommand({
    Source: process.env.EMAIL_FROM,

    Destination: {
      ToAddresses: [to],
    },

    Message: {
      Subject: {
        Data: "Verify your email - Sudanese American Society",
      },

      Body: {
        Html: {
          Data: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f8faf8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000000;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8faf8; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; width: 100%; background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.08); border-top: 4px solid #1a7f3d; border-radius: 22px; padding: 40px 32px; box-sizing: border-box;">
                                <tr>
                                    <td>
                                        <div style="margin: 0 0 8px; color: #1a7f3d; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                                            Sudanese American Society
                                        </div>
                                        <div style="width: 48px; height: 2px; background: rgba(185, 28, 28, 0.42); border-radius: 999px; margin-bottom: 24px;"></div>

                                        <h1 style="margin: 0 0 16px; color: #000000; font-size: 26px; line-height: 1.2; font-weight: 900;">
                                            Verify your email
                                        </h1>

                                        <div style="margin: 0 0 28px; padding: 18px 20px; background: linear-gradient(135deg, rgba(26, 127, 61, 0.08), rgba(185, 28, 28, 0.04)); border: 1px solid rgba(26, 127, 61, 0.12); border-radius: 16px;">
                                            <p style="margin: 0 0 8px; color: #1f1f1f; font-size: 15px; line-height: 1.5; font-weight: 700;">
                                                Welcome to the Sudanese American Society.
                                            </p>
                                            <p style="margin: 0; color: #3b3b3b; font-size: 15px; line-height: 1.6; font-weight: 500;">
                                                Please click the button below to verify your email address and activate your account.
                                            </p>
                                        </div>

                                        <div style="text-align: center; margin-bottom: 24px;">
                                            <a href="${verificationUrl}" target="_blank" style="display: block; width: 100%; padding: 14px 24px; background: #1a7f3d; color: #ffffff; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 14px; box-sizing: border-box; text-align: center;">
                                                Verify My Email
                                            </a>
                                        </div>

                                        <p style="margin: 0; color: #5a5a5a; font-size: 13px; font-style: italic; text-align: center;">
                                            This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
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
        Data: "Reset your password - Sudanese American Society",
      },
      Body: {
        Html: {
          Data: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f8faf8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000000;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8faf8; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; width: 100%; background: #ffffff; border: 1px solid rgba(0, 0, 0, 0.08); border-top: 4px solid #1a7f3d; border-radius: 22px; padding: 40px 32px; box-sizing: border-box;">
                                <tr>
                                    <td>
                                        <div style="margin: 0 0 8px; color: #1a7f3d; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                                            Sudanese American Society
                                        </div>
                                        <div style="width: 48px; height: 2px; background: rgba(185, 28, 28, 0.42); border-radius: 999px; margin-bottom: 24px;"></div>

                                        <h1 style="margin: 0 0 16px; color: #000000; font-size: 26px; line-height: 1.2; font-weight: 900;">
                                            Password Reset Request
                                        </h1>

                                        <div style="margin: 0 0 28px; padding: 18px 20px; background: linear-gradient(135deg, rgba(26, 127, 61, 0.08), rgba(185, 28, 28, 0.04)); border: 1px solid rgba(26, 127, 61, 0.12); border-radius: 16px;">
                                            <p style="margin: 0 0 12px; color: #1f1f1f; font-size: 15px; line-height: 1.5; font-weight: 700;">
                                                Hello ${firstName},
                                            </p>
                                            <p style="margin: 0; color: #3b3b3b; font-size: 15px; line-height: 1.6; font-weight: 500;">
                                                We received a request to reset the password associated with your Sudanese American Society account. If you made this request, click the button below to create a new password.
                                            </p>
                                        </div>

                                        <div style="text-align: center; margin-bottom: 24px;">
                                            <a href="${resetUrl}" target="_blank" style="display: block; width: 100%; padding: 14px 24px; background: #1a7f3d; color: #ffffff; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 14px; box-sizing: border-box; text-align: center;">
                                                Reset My Password
                                            </a>
                                        </div>

                                        <p style="margin: 0 0 16px; color: #5a5a5a; font-size: 13px; font-style: italic; text-align: center;">
                                            For your security, this link will expire in 15 minutes and can only be used once.
                                        </p>

                                        <p style="margin: 0 0 16px; color: #5a5a5a; font-size: 13px; line-height: 1.5;">
                                            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                                        </p>

                                        <p style="margin: 0; color: #5a5a5a; font-size: 13px; line-height: 1.5;">
                                            If you have any concerns about the security of your account, please contact the Sudanese American Society.
                                        </p>

                                        <p style="margin: 20px 0 0; color: #5a5a5a; font-size: 13px; line-height: 1.5;">
                                            Regards,<br>
                                            <strong style="color: #000000;">Sudanese American Society</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
          `,
        },
      },
    },
  });

  return await sesClient.send(command);
};
