import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components";

interface SuccessfulConversionEmailProps {
  userName?: string;
}

export const SuccessfulConversionEmail = ({
  userName = "there",
}: SuccessfulConversionEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        You made our nights and weekends worth it (and yes, your access is confirmed)
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logoText}>byrd</Text>

          <Text style={title}>More Than Just a Renewal</Text>

          <Text style={subtitle}>
            Team just did a happy dance (your renewal triggered it)
          </Text>

          <Section style={messageSection}>
            <Text style={messageText}>Hi {userName},</Text>
            <Text style={messageText}>
              We know this is supposed to be a standard payment confirmation
              email, but instead we wanted to drop by and say a heartfelt thanks - not just
              for the wire, but for all the feedback that's helped make Byrd
              better.
            </Text>
            <Text style={messageText}>
              Teams like yours are why we get excited about competitive
              intelligence. To make this better, we've snuck a few extra user
              seats to your account (on the house). Here's to more winning moves, together with Byrd.
            </Text>
          </Section>

          <Text style={footer}>ByrdLabs • San Francisco</Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as React.CSSProperties;

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
} as React.CSSProperties;

const logoText = {
  textAlign: "center",
  fontSize: "24px",
  color: "#000",
  marginBottom: "40px",
} as React.CSSProperties;

const title = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#000",
  marginBottom: "12px",
  textAlign: "center",
} as React.CSSProperties;

const subtitle = {
  fontSize: "18px",
  color: "#666",
  marginBottom: "32px",
  textAlign: "center",
} as React.CSSProperties;

const messageSection = {
  marginBottom: "32px",
} as React.CSSProperties;

const messageText = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#333",
  marginBottom: "16px",
} as React.CSSProperties;

const divider = {
  borderTop: "1px solid #eaeaea",
  marginTop: "24px",
  marginBottom: "24px",
} as React.CSSProperties;

const valueSection = {
  marginBottom: "32px",
} as React.CSSProperties;

const sectionTitle = {
  fontSize: "12px",
  fontWeight: "500",
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "16px",
} as React.CSSProperties;

const bulletList = {
  marginBottom: "24px",
} as React.CSSProperties;

const bulletText = {
  fontSize: "16px",
  color: "#333",
  lineHeight: "1.6",
  marginBottom: "12px",
} as React.CSSProperties;

const ctaSection = {
  textAlign: "center",
  marginBottom: "32px",
} as React.CSSProperties;

const ctaButton = {
  backgroundColor: "#000",
  color: "#fff",
  padding: "12px 32px",
  borderRadius: "6px",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "500",
  display: "inline-block",
  marginBottom: "12px",
} as React.CSSProperties;

const ctaSubtext = {
  fontSize: "14px",
  color: "#666",
  fontStyle: "italic",
  marginTop: "12px",
} as React.CSSProperties;

const closingSection = {
  textAlign: "center",
  marginBottom: "32px",
} as React.CSSProperties;

const closingText = {
  fontSize: "18px",
  fontWeight: "500",
  color: "#333",
  lineHeight: "1.5",
} as React.CSSProperties;

const supportSection = {
  textAlign: "center",
  marginBottom: "32px",
} as React.CSSProperties;

const supportText = {
  fontSize: "14px",
  color: "#666",
  marginBottom: "8px",
} as React.CSSProperties;

const supportLink = {
  color: "#000",
  textDecoration: "none",
  fontWeight: "500",
} as React.CSSProperties;

const footer = {
  fontSize: "12px",
  color: "#666",
  textAlign: "center",
} as React.CSSProperties;

export default SuccessfulConversionEmail;
