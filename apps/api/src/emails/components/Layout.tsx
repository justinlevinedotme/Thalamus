import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";
import * as React from "react";

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
  unsubscribeUrl?: string;
}

export const Layout = ({ preview, children, unsubscribeUrl }: LayoutProps) => {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={brandName}>Thalamus</Text>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} Thalamus. All rights reserved.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://thalamus.sh" style={footerLink}>
                Website
              </Link>
              {" · "}
              <Link href="https://github.com/thalamusai/thalamus" style={footerLink}>
                GitHub
              </Link>
              {unsubscribeUrl && (
                <>
                  {" · "}
                  <Link href={unsubscribeUrl} style={footerLink}>
                    Unsubscribe
                  </Link>
                </>
              )}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Minimal, clean styles matching the site
const main = {
  backgroundColor: "#f8fafc", // slate-50
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: "40px 20px",
} as React.CSSProperties;

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0", // slate-200
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "480px",
  overflow: "hidden",
} as React.CSSProperties;

const header = {
  borderBottom: "1px solid #e2e8f0", // slate-200
  padding: "24px 32px",
} as React.CSSProperties;

const brandName = {
  color: "#0f172a", // slate-900
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
  letterSpacing: "-0.025em",
} as React.CSSProperties;

const content = {
  padding: "32px",
} as React.CSSProperties;

const footer = {
  borderTop: "1px solid #e2e8f0", // slate-200
  padding: "24px 32px",
  textAlign: "center" as const,
} as React.CSSProperties;

const footerText = {
  color: "#64748b", // slate-500
  fontSize: "12px",
  margin: "0 0 8px 0",
} as React.CSSProperties;

const footerLinks = {
  color: "#94a3b8", // slate-400
  fontSize: "12px",
  margin: "0",
} as React.CSSProperties;

const footerLink = {
  color: "#64748b", // slate-500
  textDecoration: "none",
} as React.CSSProperties;

export default Layout;
