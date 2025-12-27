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

interface ConfirmEmailProps {
  userName?: string;
  verifyUrl: string;
  newEmail?: string;
}

export const ConfirmEmail = ({ userName, verifyUrl, newEmail }: ConfirmEmailProps) => {
  const isEmailChange = !!newEmail;

  return (
    <Layout
      preview={isEmailChange ? "Verify your new email address" : "Verify your Thalamus account"}
    >
      <Text style={heading}>
        {isEmailChange ? "Verify Your New Email" : "Verify Your Email Address"}
      </Text>

      <Text style={paragraph}>Hi{userName ? ` ${userName}` : ""},</Text>

      <Text style={paragraph}>
        {isEmailChange
          ? `You requested to change your email address to ${newEmail}. Please verify this new email address by clicking the button below.`
          : "Welcome to Thalamus! Please verify your email address by clicking the button below."}
      </Text>

      <Section style={buttonContainer}>
        <Button href={verifyUrl}>{isEmailChange ? "Verify New Email" : "Verify Email"}</Button>
      </Section>

      <Text style={mutedText}>
        This link will expire in 1 hour.
        {!isEmailChange && " Once verified, you'll have full access to your Thalamus account."}
      </Text>

      <Section style={warningBox}>
        <Text style={warningText}>
          If the button doesn't work, copy and paste this link into your browser:
        </Text>
      </Section>

      <Text style={codeBox}>{verifyUrl}</Text>

      <Hr style={{ borderTop: "1px solid #e2e8f0", margin: "24px 0" }} />

      <Text style={mutedText}>
        If you didn't {isEmailChange ? "request this email change" : "create a Thalamus account"},
        you can safely ignore this email.
      </Text>
    </Layout>
  );
};

export default ConfirmEmail;
