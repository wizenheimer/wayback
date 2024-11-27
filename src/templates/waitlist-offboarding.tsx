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

interface WaitlistOffboardingProps {
  userName?: string;
  inviteLink?: string;
}

export const WaitlistOffboarding = ({
  userName = "there",
  inviteLink = "https://byrdhq.com/dashboard",
}: WaitlistOffboardingProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Your Competition's Worst Nightmare Just Got Real
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logoText}>byrd</Text>

          <Text style={title}>
            Your Competition's Worst Nightmare Just Got Real
          </Text>
          <Text style={subtitle}>
            The wait is over - We are officially yours!
          </Text>

          <Section style={messageSection}>
            <Text style={messageText}>Hi {userName},</Text>
            <Text style={messageText}>
              Wish you could see every move your competitors make? Well, now you can. With Byrd, every change, no matter how small, gets flagged. From pricing shifts to product updates, you'll be the first to know.
            </Text>
          </Section>

          <Section style={featuresSection}>
            <Text style={sectionTitle}>WHAT'S INCLUDED</Text>
            <Section style={bulletList}>
              <Text style={bulletText}>
                • Page Monitoring - Stay ahead of every product move.
              </Text>
              <Text style={bulletText}>
                • Inbox Monitoring - Monitor the direct line to their customers.
              </Text>
              <Text style={bulletText}>
                • Social Monitoring - Keep a pulse on their community.
              </Text>
              <Text style={bulletText}>
                • Review Monitoring - They churn. You learn.{" "}
              </Text>
            </Section>
          </Section>

          <Section style={ctaSection}>
            <Link href={inviteLink} style={ctaButton}>
              Get Started Now
            </Link>
            <Text style={expiryText}>
              They're hoping this invite expires. Disappoint them.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={supportSection}>
            <Text style={supportText}>
              Need help? We've got your back:
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

const statsRow = {
  display: "flex",
  justifyContent: "center",
  margin: "0 -10px 32px -10px",
} as React.CSSProperties;

const statsColumn = {
  padding: "0 20px",
  textAlign: "center",
} as React.CSSProperties;

const statLabel = {
  fontSize: "12px",
  color: "#666",
  marginTop: "4px",
} as React.CSSProperties;

const statValue = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#000",
} as React.CSSProperties;

const divider = {
  borderTop: "1px solid #eaeaea",
  marginTop: "24px",
  marginBottom: "24px",
} as React.CSSProperties;

const featuresSection = {
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
  fontSize: "14px",
  color: "#333",
  lineHeight: "1.6",
  marginBottom: "8px",
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

const expiryText = {
  fontSize: "14px",
  color: "#666",
  marginTop: "8px",
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

export default WaitlistOffboarding;
