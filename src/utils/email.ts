import {
  AggregatedReport,
  CategoryBase,
  CategoryEnriched,
} from "../types/diff";
import { DiffReportEmailParameters } from "../types/email";

export const categorySummaries = {
  branding: {
    changes: [
      "Fresh paint job! They've switched up their look",
      "Brand makeover alert - new colors and vibes",
      "Visual refresh happening on their end",
      "They're playing with their brand identity",
      "Looks like they're changing how they want to be seen. Let's watch where this goes.",
      "Fresh look, new vibe. Worth seeing if it sticks.",
      "They're trying something new with their look. Keep an eye out.",
      "Brand refresh in the works. Interesting timing.",
      "New style coming through. Let's see how people take it.",
    ],
    noChanges: [
      "Their brand's staying cozy in its comfort zone",
      "No makeover this week - same look as before",
      "Brand's holding steady, no new surprises",
      "Same colors, same style - no changes here",
    ],
  },

  integration: {
    changes: [
      "New tech toys in their playground",
      "They're rewiring their connections",
      "Fresh integrations just dropped",
      "Tech stack's getting an upgrade",
      "New tools in their toolkit. Smart to watch which ones get attention.",
      "They're connecting with more tools. Makes you wonder what's next.",
      "Building bridges to new platforms. Let's see who uses them.",
      "Adding new ways to play with others. Worth tracking.",
      "More connections, more possibilities. Keep watching.",
    ],
    noChanges: [
      "Their tech stack's taking a breather",
      "Integration scene's quiet this week",
      "No new tech hookups to report",
      "Everything's stable in their tech world",
    ],
  },

  pricing: {
    changes: [
      "Money moves! Price tags are shifting",
      "They're shuffling their pricing deck",
      "New numbers on their price list",
      "Wallet check - pricing's getting tweaked",
      "Money talks. These changes say a lot.",
      "Prices are moving. Let's see who they're after.",
      "New prices, new plans. Worth watching who bites.",
      "They're testing what people will pay. Smart to keep an eye on this.",
      "Price tags are shifting. Let's see how customers react.",
    ],
    noChanges: [
      "Price tags staying put this round",
      "Your wallet can relax - no price changes",
      "Pricing's stable as a table",
      "No surprises in the pricing department",
    ],
  },

  positioning: {
    changes: [
      "They're trying on a new hat",
      "Plot twist in how they're talking to the world",
      "New tune in their market melody",
      "Fresh angle on their story",
      "They're telling a new story. Wonder who's listening.",
      "New message, new audience? Worth watching.",
      "Changed how they talk about themselves. Keep an eye on this.",
      "Fresh pitch, fresh angle. Let's see if it lands.",
      "They're speaking differently now. Interesting shift.",
    ],
    noChanges: [
      "Same story, same stage",
      "Their position's locked in place",
      "No new moves in their market dance",
      "Still singing the same tune",
    ],
  },

  product: {
    changes: [
      "New treats in their product cookie jar",
      "Feature factory's been busy",
      "Fresh goodies in their product lineup",
      "They've been tinkering with their tools",
      "New toys in the box. Let's see who plays with them.",
      "Fresh features dropping. Worth watching what catches on.",
      "They're building new stuff. Keep an eye on what sticks.",
      "Product's growing. Smart to watch where it goes.",
      "New things to play with. Let's see who loves them.",
    ],
    noChanges: [
      "Product line's taking a power nap. No new features this week",
      "Workshop's quiet this week. No new tools",
      "No new tricks up their product sleeve. Same tools in the toolbox",
      "Same tools in the toolbox. No new features",
    ],
  },

  partnership: {
    changes: [
      "New friends at their lunch table",
      "They're expanding their circle",
      "Fresh handshakes in the business",
      "New names in their contact list",
      "Making new friends. Worth seeing where this goes.",
      "New names in their circle. Let's watch what happens.",
      "They're teaming up. Smart to keep an eye on this.",
      "New partnerships brewing. Could be interesting.",
      "Fresh faces joining their team. Worth tracking.",
    ],
    noChanges: [
      "No new names in their friend list",
      "Partnership dance floor's quiet",
      "Same crew as last week",
      "No new alliance alerts",
    ],
  },
};

export const getRandomSummary = (
  category: string,
  hasChanges: boolean
): string => {
  const summaries =
    categorySummaries[category as keyof typeof categorySummaries];
  const list = hasChanges ? summaries.changes : summaries.noChanges;
  return (
    list[Math.floor(Math.random() * list.length)] ||
    "Something's cooking - we're keeping tabs"
  );
};

function getDateFromWeek(
  weekNumber: number,
  year: number = new Date().getFullYear(),
  dayOfWeek = 1
) {
  // Create date object for January 1st of the given year
  const januaryFirst = new Date(year, 0, 1);

  // Get the day of week for January 1st (0 = Sunday, 1 = Monday, etc.)
  const dayOffset = januaryFirst.getDay();

  // Calculate days to add to get to the first week
  // If January 1st is not a Monday, we need to adjust
  const daysToAdd = (weekNumber - 1) * 7 + (dayOfWeek - 1) + dayOffset;

  // Add the calculated days to January 1st
  const resultDate = new Date(year, 0, 1 + daysToAdd);

  return resultDate;
}

function getWeekNumber(date = new Date()) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export const reportToEmailParams = (
  enrichedReport: AggregatedReport
): DiffReportEmailParameters => {
  const ensureSummary = (
    category: CategoryBase | CategoryEnriched,
    categoryName: string
  ): CategoryEnriched => {
    const hasChanges = category.changes.length > 0;

    if ("summary" in category && hasChanges) {
      return category as CategoryEnriched;
    }

    return {
      ...category,
      summary: getRandomSummary(categoryName, hasChanges),
    };
  };

  const weekNumber =
    Number.parseInt(enrichedReport.metadata.weekNumber) || getWeekNumber();
  const fromDateOffset =
    Math.max(Number.parseInt(enrichedReport.metadata.runRange.fromRun), 7) || 0;
  const toDateOffset =
    Math.min(Number.parseInt(enrichedReport.metadata.runRange.toRun), 7) || 7;

  console.log("fromDateOffset", fromDateOffset);
  console.log("toDateOffset", toDateOffset);
  console.log("weekNumber", weekNumber);
  // Have date without time
  const fromDate = getDateFromWeek(weekNumber, 2024, fromDateOffset)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .split("/")
    .join("");

  const toDate = getDateFromWeek(weekNumber, 2024, toDateOffset)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .split("/")
    .join("");

  console.log("fromDate", fromDate);
  console.log("toDate", toDate);

  return {
    kind: "diff-report",
    competitor: enrichedReport.metadata.competitor,
    fromDate: fromDate,
    toDate: toDate,
    data: {
      branding: ensureSummary(enrichedReport.data.branding, "branding"),
      integration: ensureSummary(
        enrichedReport.data.integration,
        "integration"
      ),
      pricing: ensureSummary(enrichedReport.data.pricing, "pricing"),
      positioning: ensureSummary(
        enrichedReport.data.positioning,
        "positioning"
      ),
      product: ensureSummary(enrichedReport.data.product, "product"),
      partnership: ensureSummary(
        enrichedReport.data.partnership,
        "partnership"
      ),
    },
  };
};
