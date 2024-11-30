// Define the parameters our workflow expects
type ScreenshotDiffWorkflowParams = {
  url: string;
  runId: "1" | "7"; // We only support runId 1 and 7 - 1 is the first run, 7 is the last run for a given week
  weekNumber: string;
};

type CommpetitorReportWorkflowParams = {
  competitorId: number;
  runId1: string;
  runId2: string;
  weekNumber: string;
};

interface WorkflowStatusResponse {
  workflowId: string;
  type: "screenshot" | "competitor";
  status: {
    state: string;
    error?: string;
    output?: unknown;
  };
}
