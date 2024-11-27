// src/templates/diff-report.tsx
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
  Row,
  Column,
} from "@react-email/components";

interface ChangeData {
  summary: string;
  changes: string[];
  urls: {
    [key: string]: string[];
  };
}

interface DiffData {
  branding: ChangeData;
  integration: ChangeData;
  pricing: ChangeData;
  positioning: ChangeData;
  product: ChangeData;
  partnership: ChangeData;
}

interface DiffReportEmailProps {
  competitor?: string;
  fromDate?: string;
  toDate?: string;
  generatedAt?: string;
  data?: DiffData;
}

export const DiffReportEmail = ({
  competitor = "Acme Corporation",
  fromDate = "01022024",
  toDate = "15032024",
  generatedAt = new Date().toISOString(),
  data = defaultData,
}: DiffReportEmailProps) => {
  const formatDate = (dateString: string) => {
    const year = dateString.slice(4);
    const month = dateString.slice(2, 4);
    const day = dateString.slice(0, 2);
    return `${day}/${month}/${year}`;
  };

  const ChangeList = ({ title, data }: { title: string; data: ChangeData }) => (
    <Section style={changeSection}>
      <Text style={sectionTitle}>{title}</Text>
      <Text style={sectionSummary}>{data.summary}</Text>
      <Section style={bulletList}>
        {data.changes.map((change, index) => {
          const [url] = Object.entries(data.urls).find(([_, changes]) =>
            changes.includes(change)
          ) || [];

          return (
            <Section key={index} style={bulletItem}>
              <Text style={bulletText}>
                • {change}{" "}
                {url && (
                  <Link href={url} style={learnMoreLink}>
                    · Learn more
                  </Link>
                )}
              </Text>
            </Section>
          );
        })}
      </Section>
      <Hr style={divider} />
    </Section>
  );

  return (
    <Html>
      <Head />
      <Preview>Weekly Roundup for {competitor}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logoText}>byrd</Text>

          <Text style={title}>Weekly Roundup for {competitor}</Text>

          <Text style={dateContainer}>
            {formatDate(fromDate)} → {formatDate(toDate)}
          </Text>

          <ChangeList title="BRANDING" data={data.branding} />
          <ChangeList title="PRICING" data={data.pricing} />
          <ChangeList title="INTEGRATION" data={data.integration} />
          <ChangeList title="PRODUCT" data={data.product} />
          <ChangeList title="POSITIONING" data={data.positioning} />
          <ChangeList title="PARTNERSHIPS" data={data.partnership} />

          <Text style={footer}>
            {new Date(generatedAt).toLocaleDateString()}
          </Text>
          <Text style={footer}>
            ByrdLabs • San Francisco
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Default data for preview/testing
const defaultData: DiffData = {
  branding: {
    summary: "Refreshed logo design and updated website typography. Seems like they're going for a more modern look.",
    changes: [
      "Refreshed logo design with new monochrome palette",
      "Updated website typography to SF Pro Display",
      "Changed primary brand color from blue (#1DA1F2) to purple (#5865F2)",
    ],
    urls: {
      "https://competitor.com": [
        "Refreshed logo design with new monochrome palette",
      ],
      "https://competitor.com/brand": [
        "Updated website typography to SF Pro Display",
        "Changed primary brand color from blue (#1DA1F2) to purple (#5865F2)",
      ],
    },
  },
  integration: {
    summary: "Added Salesforce integration, deprecated XML API endpoints. SDKs for Python and Ruby are now in beta.",
    changes: [
      "Added native Salesforce integration with real-time sync",
      "Deprecated XML API endpoints, migration deadline Q3 2024",
      "Released Python and Ruby SDKs in beta",
    ],
    urls: {
      "https://competitor.com/integrations": [
        "Added native Salesforce integration with real-time sync",
      ],
      "https://competitor.com/developers": [
        "Deprecated XML API endpoints, migration deadline Q3 2024",
        "Released Python and Ruby SDKs in beta",
      ],
    },
  },
  pricing: {
    summary: "Increased enterprise tier pricing by 15%. Introduced new 'Growth' tier at $499/month. Added usage-based pricing option for API calls.",
    changes: [
      "Increased enterprise tier pricing by 15% ($1000 to $1150/month)",
      'Introduced new "Growth" tier at $499/month',
      "Added usage-based pricing option for API calls",
    ],
    urls: {
      "https://competitor.com/pricing": [
        "Increased enterprise tier pricing by 15% ($1000 to $1150/month)",
        'Introduced new "Growth" tier at $499/month',
        "Added usage-based pricing option for API calls",
      ],
    },
  },
  positioning: {
    summary: "Shifted focus from SMBs to enterprise customers. New emphasis on AI and automation capabilities.",
    changes: [
      "Shifted focus from SMBs to enterprise customers",
      "New emphasis on AI and automation capabilities",
    ],
    urls: {
      "https://competitor.com": [
        "Shifted focus from SMBs to enterprise customers",
        "New emphasis on AI and automation capabilities",
      ],
    },
  },
  product: {
    summary: "Launched AI-powered content suggestions feature. Redesigned analytics dashboard with real-time metrics.",
    changes: [
      "Launched AI-powered content suggestions feature",
      "Redesigned analytics dashboard with real-time metrics",
    ],
    urls: {
      "https://competitor.com/features": [
        "Launched AI-powered content suggestions feature",
        "Redesigned analytics dashboard with real-time metrics",
      ],
    },
  },
  partnership: {
    summary: "Strategic partnership announced with Microsoft Azure. Joined Salesforce ISV Partner Program.",
    changes: [
      "Strategic partnership announced with Microsoft Azure",
      "Joined Salesforce ISV Partner Program",
    ],
    urls: {
      "https://competitor.com/partners": [
        "Strategic partnership announced with Microsoft Azure",
        "Joined Salesforce ISV Partner Program",
      ],
    },
  },
};

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const logoText = {
  textAlign: "center" as const,
  fontSize: "24px",
  color: "#000",
  marginBottom: "40px",
};

const title = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#000",
  marginBottom: "20px",
  textAlign: "center" as const,
};

const dateContainer = {
  fontSize: "14px",
  color: "#666",
  marginBottom: "40px",
  textAlign: "center" as const,
};

const statsContainer = {
  textAlign: "center" as const,
}

const statsRow = {
  display: "flex",
  justifyContent: "space-between",
  margin: "0 -10px 32px -10px",
};

const statsColumn = {
  padding: "0 10px",
  textAlign: "center" as const,
  flex: "1",
};

const statLabel = {
  fontSize: "12px",
  color: "#666",
  marginTop: "4px",
};

const statValue = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#000",
};

const divider = {
  borderTop: "1px solid #eaeaea",
  marginTop: "24px",
  marginBottom: "24px",
};

const changeSection = {
  marginBottom: "24px",
};

const sectionTitle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#666",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: "12px",
};

const sectionSummary = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#333",
  marginBottom: "16px",
}

const bulletList = {
  paddingLeft: "0",
  margin: "12px 0",
};

const bulletItem = {
  marginBottom: "8px",
};

const bulletText = {
  fontSize: "14px",
  color: "#000",
  lineHeight: "1.4",
  paddingLeft: "16px",
  textIndent: "-16px",
  margin: "0",
};

const learnMoreLink = {
  fontSize: "13px",
  color: "#666",
  textDecoration: "none",
  fontWeight: "400",
};

const footer = {
  fontSize: "12px",
  color: "#666",
  marginTop: "8px",
  textAlign: "center" as const,
};

export default DiffReportEmail;
