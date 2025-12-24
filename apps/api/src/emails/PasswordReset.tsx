import { Hr, Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "./components/Layout";
import { Button } from "./components/Button";
import {
  heading,
  paragraph,
  mutedText,
  warningBox,
  warningText,
  buttonContainer,
  codeBox,
} from "./components/styles";

interface PasswordResetProps {
  userName?: string;
  resetUrl: string;
}

export const PasswordReset = ({ userName, resetUrl }: PasswordResetProps) => {
  return (
    <Layout preview="Reset your Thalamus password">
      <Text style={heading}>Reset Your Password</Text>

      <Text style={paragraph}>
        Hi{userName ? ` ${userName}` : ""},
      </Text>

      <Text style={paragraph}>
        We received a request to reset the password for your Thalamus account.
        Click the button below to create a new password.
      </Text>

      <Section style={buttonContainer}>
        <Button href={resetUrl}>Reset Password</Button>
      </Section>

      <Text style={mutedText}>
        This link will expire in 1 hour. If you didn't request a password reset,
        you can safely ignore this email.
      </Text>

      <Section style={warningBox}>
        <Text style={warningText}>
          If the button doesn't work, copy and paste this link into your
          browser:
        </Text>
      </Section>

      <Text style={codeBox}>{resetUrl}</Text>

      <Hr style={{ borderTop: "1px solid #e2e8f0", margin: "24px 0" }} />

      <Text style={mutedText}>
        If you didn't request this password reset, please ignore this email or
        contact support if you have concerns about your account security.
      </Text>
    </Layout>
  );
};

export default PasswordReset;
