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

interface WaitlistOnboardingProps {
  userName?: string;
}

export const WaitlistOnboarding = ({
  userName = "there",
}: WaitlistOnboardingProps) => {
  return (
    <Html>
      <Head />
      <Preview>Good things come to those who... actually, let's speed this up</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logoText}>byrd</Text>

          <Text style={title}>You're Almost There</Text>

          <Section style={messageSection}>
            <Text style={messageText}>Hi {userName},</Text>
            <Text style={messageText}>
              We're thrilled to have you on board! We're gradually rolling out
              access for new teams, and will reach out to you with your onboarding details
              as soon as your spot opens up.
            </Text>
            <Text style={messageText}>
              While we know waiting isn't ideal, we've prepared some excellent resources to help you make the most of this time. From swipe files to sales battlecards, you'll have access to the exact tools our top users rely on - and they're yours to keep!
            </Text>
          </Section>

          <Section style={escapeSection}>
            <Text style={escapeSubtext}>Can't Wait? Don't Wait</Text>
            <Text style={escapeText}>
              {"Incase waiting doesn't work for you (we understand!), "}
              <Link href="https://cal.com/nayann/byrd" style={escapeLink}>
                reach out to us
              </Link>
              . We're founders too and we occasionally fast-track access for
              teams who are ready to dive straight in.
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
  fontWeight: "600",
  color: "#000",
  marginBottom: "32px",
  textAlign: "center",
} as React.CSSProperties;

const messageSection = {
  marginBottom: "32px",
} as React.CSSProperties;

const messageText = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#333",
  marginBottom: "16px",
} as React.CSSProperties;

const ctaSection = {
  textAlign: "center",
  marginBottom: "32px",
  backgroundColor: "#f8f9fa",
  padding: "24px",
  borderRadius: "8px",
} as React.CSSProperties;

const moveUpText = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#000",
  marginBottom: "16px",
} as React.CSSProperties;

const ctaButton = {
  backgroundColor: "#000",
  color: "#fff",
  padding: "16px 32px",
  borderRadius: "6px",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "500",
  display: "inline-block",
  marginBottom: "16px",
} as React.CSSProperties;

const referralText = {
  fontSize: "14px",
  color: "#333",
  lineHeight: "1.6",
  marginBottom: "8px",
} as React.CSSProperties;

const referralSubtext = {
  fontSize: "14px",
  color: "#666",
  fontStyle: "italic",
} as React.CSSProperties;

const divider = {
  borderTop: "1px solid #eaeaea",
  marginTop: "32px",
  marginBottom: "32px",
} as React.CSSProperties;

const resourcesSection = {
  marginBottom: "32px",
} as React.CSSProperties;

const sectionTitle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#000",
  marginBottom: "16px",
} as React.CSSProperties;

const resourcesText = {
  fontSize: "16px",
  color: "#333",
  marginBottom: "16px",
  lineHeight: "1.6",
} as React.CSSProperties;

const bulletList = {
  marginBottom: "16px",
} as React.CSSProperties;

const bulletText = {
  fontSize: "14px",
  color: "#333",
  lineHeight: "1.6",
  marginBottom: "8px",
} as React.CSSProperties;

const resourcesFooter = {
  fontSize: "14px",
  color: "#666",
  fontStyle: "italic",
  marginTop: "16px",
} as React.CSSProperties;

const escapeSection = {
  textAlign: "center",
  marginBottom: "32px",
  backgroundColor: "#f8f9fa",
  padding: "24px",
  borderRadius: "8px",
} as React.CSSProperties;

const escapeTitle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#000",
  marginBottom: "16px",
} as React.CSSProperties;

const escapeText = {
  fontSize: "14px",
  color: "#333",
  lineHeight: "1.6",
  marginBottom: "8px",
} as React.CSSProperties;

const escapeSubtext = {
  fontSize: "14px",
  color: "#666",
  fontStyle: "italic",
} as React.CSSProperties;

const escapeLink = {
  color: "#000",
  textDecoration: "underline",
  fontWeight: "500",
} as React.CSSProperties;

const footer = {
  fontSize: "12px",
  color: "#666",
  textAlign: "center",
  marginTop: "32px",
} as React.CSSProperties;

export default WaitlistOnboarding;
