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

interface FailedConversionEmailProps {
  userName?: string;
  upgradeLink?: string;
}

export const FailedConversionEmail = ({
  userName = "there",
  upgradeLink = "https://byrdhq.com/upgrade",
}: FailedConversionEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Spot's Still Warm. Let's Figure This Out Together.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logoText}>byrd</Text>

          <Text style={title}>Your Spot's Still Warm</Text>

          <Text style={subtitle}>Let's Figure This Out Together</Text>

          <Section style={messageSection}>
            <Text style={messageText}>Hi {userName},</Text>
            <Text style={messageText}>
              Not going to lie - our team's going to miss
              having you around. Wanted to drop by and see if we can
              do right by you.
            </Text>
            <Text style={messageText}>
              Mind if I ask what held you back from an upgrade? Hit reply with
              any feedback (good or bad), and we'll extend your access for a
              month.
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Link href={upgradeLink} style={ctaButton}>
              Claim an Extension
            </Link>
            <Text style={ctaSubtext}>
              Your first month on us. No strings attached.
            </Text>
          </Section>

          <Section style={supportSection}>
            <Text style={supportText}>
              Want to discuss a quote that works for your team?
            </Text>
            <Link href="mailto:hey@byrd.com" style={supportLink}>
              hey@byrd.com
            </Link>
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

export default FailedConversionEmail;
