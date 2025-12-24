import { render } from "@react-email/components";
import * as React from "react";

import { PasswordReset } from "./PasswordReset";
import { ConfirmEmail } from "./ConfirmEmail";
import { Welcome } from "./Welcome";
import { AccountDeletion } from "./AccountDeletion";

// Export components for direct use
export { PasswordReset, ConfirmEmail, Welcome, AccountDeletion };

// Helper function to render email templates to HTML
export async function renderEmail(
  template: React.ReactElement
): Promise<string> {
  return render(template);
}

// Pre-built render functions for each email type
export const emails = {
  passwordReset: async (props: { userName?: string; resetUrl: string }) => {
    return renderEmail(React.createElement(PasswordReset, props));
  },

  confirmEmail: async (props: {
    userName?: string;
    verifyUrl: string;
    newEmail?: string;
  }) => {
    return renderEmail(React.createElement(ConfirmEmail, props));
  },

  welcome: async (props: { userName?: string; loginUrl?: string; unsubscribeUrl?: string }) => {
    return renderEmail(React.createElement(Welcome, props));
  },

  accountDeletion: async (props: {
    userName?: string;
    confirmUrl: string;
    expiresIn?: string;
  }) => {
    return renderEmail(React.createElement(AccountDeletion, props));
  },
};

export default emails;
