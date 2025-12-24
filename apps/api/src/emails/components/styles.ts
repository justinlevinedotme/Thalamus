import * as React from "react";

export const heading = {
  color: "#0f172a",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 16px 0",
  lineHeight: "1.3",
} as React.CSSProperties;

export const paragraph = {
  color: "#334155",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
} as React.CSSProperties;

export const mutedText = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 16px 0",
} as React.CSSProperties;

export const codeBox = {
  backgroundColor: "#f1f5f9",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px",
  fontFamily: "monospace",
  fontSize: "14px",
  color: "#0f172a",
  wordBreak: "break-all" as const,
  margin: "16px 0",
} as React.CSSProperties;

export const warningBox = {
  backgroundColor: "#fef3c7",
  border: "1px solid #fcd34d",
  borderRadius: "8px",
  padding: "12px 16px",
  margin: "16px 0",
} as React.CSSProperties;

export const warningText = {
  color: "#92400e",
  fontSize: "13px",
  margin: "0",
  lineHeight: "1.5",
} as React.CSSProperties;

export const dangerBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "12px 16px",
  margin: "16px 0",
} as React.CSSProperties;

export const dangerText = {
  color: "#991b1b",
  fontSize: "13px",
  margin: "0",
  lineHeight: "1.5",
} as React.CSSProperties;

export const divider = {
  borderTop: "1px solid #e2e8f0",
  margin: "24px 0",
} as React.CSSProperties;

export const buttonContainer = {
  margin: "24px 0",
  textAlign: "center" as const,
} as React.CSSProperties;
