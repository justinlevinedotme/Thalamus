import { Hr, Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "./components/Layout";
import { Button } from "./components/Button";
import {
  heading,
  paragraph,
  mutedText,
  dangerBox,
  dangerText,
  buttonContainer,
  codeBox,
} from "./components/styles";

interface AccountDeletionProps {
  userName?: string;
  confirmUrl: string;
  expiresIn?: string;
}

export const AccountDeletion = ({
  userName,
  confirmUrl,
  expiresIn = "24 hours",
}: AccountDeletionProps) => {
  return (
    <Layout preview="Confirm your account deletion request">
      <Text style={heading}>Account Deletion Request</Text>

      <Text style={paragraph}>Hi{userName ? ` ${userName}` : ""},</Text>

      <Text style={paragraph}>
        We received a request to permanently delete your Thalamus account. This action cannot be
        undone.
      </Text>

      <Section style={dangerBox}>
        <Text style={dangerText}>
          <strong>Warning:</strong> Deleting your account will permanently remove:
        </Text>
        <Text style={{ ...dangerText, marginTop: "8px" }}>
          - All your graphs and data
          <br />
          - All shared links and collaborations
          <br />- Your profile and settings
        </Text>
      </Section>

      <Text style={paragraph}>
        If you're sure you want to delete your account, click the button below to confirm:
      </Text>

      <Section style={buttonContainer}>
        <Button href={confirmUrl} variant="danger">
          Delete My Account
        </Button>
      </Section>

      <Text style={mutedText}>
        This confirmation link will expire in {expiresIn}. After that, you'll need to request
        deletion again.
      </Text>

      <Section
        style={{
          backgroundColor: "#f1f5f9",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "12px 16px",
          margin: "16px 0",
        }}
      >
        <Text
          style={{
            color: "#475569",
            fontSize: "13px",
            margin: "0",
            lineHeight: "1.5",
          }}
        >
          If the button doesn't work, copy and paste this link:
        </Text>
      </Section>

      <Text style={codeBox}>{confirmUrl}</Text>

      <Hr style={{ borderTop: "1px solid #e2e8f0", margin: "24px 0" }} />

      <Text style={mutedText}>
        <strong>Didn't request this?</strong> If you didn't request to delete your account, please
        ignore this email. Your account will remain safe. Consider changing your password if you're
        concerned about unauthorized access.
      </Text>
    </Layout>
  );
};

export default AccountDeletion;
