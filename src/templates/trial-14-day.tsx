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

interface Trial14DayEmailProps {
  userName?: string;
  upgradeLink?: string;
}

export const Trial14DayEmail = ({
  userName = "there",
  upgradeLink = "https://byrdhq.com/upgrade",
}: Trial14DayEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        That's not marketing. That's just math
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logoText}>byrd</Text>

          <Text style={title}>Save One Deal, and We're Effectively Free</Text>

          <Text style={subtitle}>That's not marketing. That's just math</Text>

          <Section style={messageSection}>
            <Text style={messageText}>Hi {userName},</Text>
            <Text style={messageText}>
              Your trial has been running strong for 14 days now, and your
              competitors have been keeping us busy.
            </Text>
            <Text style={messageText}>
              Ready to Mmake all of this Official? Subscribe to a paid plan to lock in
              everything you're using now, plus some features tailored just for
              you.
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Link href={upgradeLink} style={ctaButton}>
              Subscribe Now
            </Link>
            <Text style={ctaSubtext}>Lock in early-adopter pricing</Text>
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

export default Trial14DayEmail;
