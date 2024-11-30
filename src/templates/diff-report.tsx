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
  competitor = "Competitor",
  fromDate = "01022024",
  toDate = "15032024",
  generatedAt = new Date().toISOString(),
  data,
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

  const previewText = getRandomSubjectLine();

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logoText}>byrd</Text>

          <Text style={title}>Weekly Roundup for {competitor}</Text>

          <Text style={dateContainer}>
            {formatDate(fromDate)} → {formatDate(toDate)}
          </Text>

          <ChangeList title="BRANDING" data={data!.branding} />
          <ChangeList title="PRICING" data={data!.pricing} />
          <ChangeList title="INTEGRATION" data={data!.integration} />
          <ChangeList title="PRODUCT" data={data!.product} />
          <ChangeList title="POSITIONING" data={data!.positioning} />
          <ChangeList title="PARTNERSHIPS" data={data!.partnership} />

          <Text style={footer}>
            {new Date(generatedAt).toLocaleDateString()}
          </Text>
          <Text style={footer}>
            ByrdLabs . San Francisco
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Default data for preview/testing
const emailPreviewText = [
  "Welcome to this week's market mess report",
  "Welcome to this week's market mess update",
  "Welcome to this week's market mess recap",
  "Your competition's receipts just dropped",
  "Your competition's receipts just leaked",
  "Your competition's receipts just spilled",
  "Your competition's receipts just slipped",
  "Your competition's receipts just tripped",
  "Get ready to take notes",
  "This is your weekly roundup",
  "This is your weekly digest",
  "This is your weekly summary",
  "Your rivals are wildin, here's the scoop",
  "Someone's strategy is showing",
  "Someone's hand is showing",
  "Someone's cards are showing",
  "Rivals think stealth mode works (cute)",
  "Your competition needs a reality check",
  "Your competition needs a vibe check",
  "Your competition needs a vibe shift",
  "Your competition needs a vibe change",
  "Moves that make you go hmmmmm",
  "Moves that make you go huhhhh",
  "Hot enough to need a disclaimer",
  "Good enough to need a disclaimer",
  "Wild enough to need a disclaimer",
  "Your competition is on one",
  "Forecast: Cloudy with a chance of market chaos",
  "Forecast: Cloudy with a chance of market drama",
  "Forecast: Cloudy with a chance of market mess",
  "Your competition's having a character arc",
  "Your competition's having a glow up",
  "Your competition's having a moment",
  "Your competition's giving main character energy",
  "Moves spicier than your lunch plans",
  "Moves spicier than your dinner plans",
  "Moves spicier than your weekend plans",
  "Moves spicier than your vacation plans",
  "Moves spicier than your holiday plans",
  "Your rivals are having a moment (we documented it)",
  "Your competition's got a new look",
  "Today's episode of Markets Gone Wild",
  "Your competition's got a new vibe",
  "Your market's group chat is popping off",
  "Market moves that deserve popcorn",
  "Your competition's got a new groove",
  "Your rivals are testing in production (again)",
  "Your competition's got a new flavor",
  "Meme worthy market moves",
  "Your competition's got a new swagger",
  "Drama that's too good to be fiction",
  "Drama that's too good to be reality",
  "Your competition's got a new strut",
  "Drama that's too hot for LinkedIn",
  "Someone's been watching too much Shark Tank",
  "Someone's been watching too much The Office",
  "Moves that make you go 'wait, what?'",
  "Moves that make you go 'wait, really?'",
  "Moves that make analysts text each other",
  "Things you can't make up",
  "Serving hot takes on a silver platter",
  "Maybe your rivals wanna go viral",
  "Maybe your team isn't the only ones watching",
  "Some try hard moves, some head scratchers",
  "Some try hard moves, some head turners",
  "Some try hard moves, some head shakers",
  "Some try hard moves, some head nodders",
  "Some try hard moves, some head bangers",
  "Some try hard moves, some head spinners",
  "Some try hard moves, some head twisters",
  "Not sure if your competition's serious",
  "Not sure if your competition's joking",
  "Not sure if your competition's trolling",
  "Intel that's too hot to handle",
  "Competitors are having a moment, we're watching",
  "Clearly someone's been watching too much Netflix",
  "Clearly someone's been watching too much TikTok",
  "They are doing that thing again",
  "They are doing that thing we talked about",
  "Your rivals think they're invisible (adorable)",
  "Your rivals think they're slick (adorable)",
  "Your rivals think they're sneaky (adorable)",
  "Your rivals think they're smooth (adorable)",
  "Your rivals think they're sly (adorable)",
  "Your rivals think they're crafty (adorable)",
  "Someone left their strategy on read receipts",
  "Someone left their strategy on delivered",
  "Someone left their cards on the table",
  "Someone left their strategy on read",
  "Rival left their camera on, we saw everything",
  "Rival left their mic on, we heard everything",
  "Three words: Market. Mess. Report.",
  "Three words: Market. Mess. Update.",
  "Three words: Market. Mess. Recap.",
  "Three words: Market. Mess. Roundup.",
  "Three words: Market. Mess. Digest.",
  "Three words: Market. Mess. Summary.",
  "Three words: Market. Mess. Highlights.",
  "Moves that should've been left in the group chat",
  "Moves that should've been left in the team meeting",
  "Moves that should've been left in the boardroom",
  "Moves that should've been left in the Slack channel",
  "Moves that should've been left in the email thread",
  "Some wild moves, some mild moves",
  "Some wild moves, some mild grooves",
  "Some wild moves, some mild vibes",
  "Some wild moves, some mild flavors",
  "You win some, you lose some",
  "You win some, you snooze some",
  "You win some, you cruise some",
  "You win some, you bruise some",
  "You win some, you choose some",
  "You win some, you confuse some",
  "You win some, you amuse some",
  "You win some, you bemuse some",
  "Less boring than your last meeting",
  "Less boring than your last webinar",
  "Less boring than your last podcast",
  "Less boring than your last presentation",
  "Less boring than your last keynote",
  "Less boring than your last panel",
  "Less boring than your last fireside chat",
  "Less boring than your last town hall",
  "More interesting than your last meeting",
  "More interesting than your last webinar",
  "More interesting than your last podcast",
  "More interesting than your last presentation",
  "More interesting than your last keynote",
  "More interesting than your last panel",
  "More interesting than your last fireside chat",
  "More interesting than your last town hall",
  "More interesting than your last conference",
  "More interesting than your last summit",
  "More interesting than your last retreat",
  "More interesting than your last workshop",
  "More interesting than your last seminar",
  "Someone's treating roadmaps like mood boards",
  "Someone's treating roadmaps like dream boards",
  "Numbers that make you go 'wait, what?'",
  "Emails that could've been a tweet",
  "Moves that could've been a tweet",
  "Someone's clearly been watching too much YouTube",
  "Someone's clearly been watching too much Hulu",
  "Someone's clearly been watching too much HBO",
  "Someone's clearly been watching too much Disney+",
  "Someone's clearly been watching too much Amazon Prime",
  "Someone's clearly been watching too much Apple TV+",
  "Someone's clearly been watching too much Netflix",
  "Someone's clearly been watching too much TikTok",
  "Someone's clearly been watching too much Twitch",
  "Someone's clearly been watching too much Twitter",
  "Like a reality show, but for markets",
  "Like a reality show, but for competitors",
  "Like a reality show, but for rivals",
  "Like a reality show, but for competitors",
  "Someone woke up and chose delusion",
  "Someone woke up and chose illusion",
  "Bestie, it's wild out there",
  "Bestie, we caught them slipping",
  "Bestie, we caught them tripping",
  "Bestie, we caught them slipping and tripping",
  "Bestie, we caught them slipping and sliding",
  "Bestie, we caught them slipping and gliding",
  "Someone's A/B testing their way to sanity",
  "Someone's A/B testing their way to clarity",
  "Definitely not main character behavior",
  "Absolutely main character behavior",
  "Maybe invest in popcorn stocks",
  "Caught them in their flop era",
  "Caught them in their glow up era",
  "Didn't see that coming, did you?",
  "Didn't see that coming, did you? (we did)",
  "Moves that seem to be testing gravity",
  "Quiet ones are making noise",
  "Quiet ones are making moves",
  "Quiet ones are making waves",
  "Quiet ones are making ripples",
  "Oh, you're gonna wanna see this",
  "Oh, you're gonna wanna hear this",
  "Oh, you're gonna wanna read this",
  "Oh, you're gonna wanna watch this",
  "Oh, you're gonna wanna know this",
  "Oh, you're gonna like this one",
  "Oh, you're gonna love this one",
  "Oh, you're gonna hate this one",
  "Oh, you're gonna need this one",
  "Oh, you're gonna want this one",
  "Well, well, well, look who's back",
  "Well, well, well, look who's here",
  "Well, well, well, look who's making moves",
  "Well, well, well, look who's making waves",
  "Well, well, well, look who's making ripples",
  "Well things just got interesting",
  "Well things just got spicy",
  "Well things just got saucy",
  "Markets getting weird (in a good way ofc)",
  "They are definitely up to something",
  "They are definitely on to something",
  "They are definitely trying something",
  "Emperror has no moats",
  "Unicorn to uni-gone",
  "All pitch, no product",
  "All product, no pitch",
  "Turns out their secret sauce was just ketchup",
  "Turns out their secret sauce was just mayo",
  "Turns out their secret sauce was just mustard",
  "Turns out their secret sauce was just ranch",
  "Turns out their secret sauce was just BBQ",
  "Their secret sauce is running out",
  "Their secret sauce is getting stale",
  "From rocket ship to rocket RIP",
  "From market share to market scare",
  "Their SaaS just got sass'd",
  "Their SaaS just got sass'd up",
  "Their SaaS just got sass'd down",
  "Their SaaS just got sass'd around",
  "Their SaaS just got sass'd in",
  "Their SaaS just got sass'd out",
  "Their SaaS just got sass'd off",
  "Their SaaS just got sass'd on",
  "Their SaaS just got sass'd over",
  "Their SaaS just got sass'd under",
  "Their SaaS just got sass'd through",
  "Their SaaS just got sass'd by",
  "Their SaaS just got sass'd for",
  "Their SaaS just got sass'd with",
  "Wait, they're pivoting to what now?",
  "Wait, they're pivoting to where now?",
  "Wait, they're pivoting to who now?",
  "You might wanna sit down for this",
  "You might wanna stand up for this",
  "You might wanna lay down for this",
  "You might wanna take notes for this",
  "You might wanna grab a snack for this",
  "You might wanna grab a drink for this",
  "You might wanna grab a coffee for this",

]

function getRandomSubjectLine(): string {
  const randomIndex = Math.floor(Math.random() * emailPreviewText.length);
  return emailPreviewText[randomIndex];
}

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
