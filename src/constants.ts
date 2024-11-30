// src/constants.ts

const docsStub = "/docs";

const baseStub = "/api";

const versionStub = `${baseStub}/v1`;

// ==================== Screenshots ====================

const screenshotBaseEndpoint = `${versionStub}/screenshots`;

// Create a new screenshot
const screenshotCreationEndpoint = ``;

// Get the content of a screenshot
const screenshotContentQueryEndpoint = `/content/:hash/:weekNumber/:runId`;

// Get the image of a screenshot
const screenshotImageQueryEndpoint = `/screenshot/:hash/:weekNumber/:runId`;

// ==================== Diff ====================

const diffBaseEndpoint = `${versionStub}/diff`;

// Get the history of a diff
const diffHistoryEndpoint = `/history`;

// Create a new diff
const diffCreationEndpoint = ``;

// Create a new report
const reportCreationEndpoint = `/report`;

// ==================== Competitors Aggregate ====================

const competitorsBaseEndpoint = `${versionStub}/competitors`;

// Create a new competitor
const createCompetitorEndpoint = ``;

// List all competitors
const listCompetitorsEndpoint = ``;

// List competitor URLs with pagination and optional domain hash filter
const listCompetitorsURLs = `/url`;

// List competitor URLs by hash
const listCompetitorsbyHash = `/hash/:hash`;

// ==================== Competitors Individual ====================

// Update any property in an existing competitor
const updateCompetitorEndpoint = `/id/:id`;

// Update the URL of a competitor
const updateCompetitorURLEndpoint = `/id/:id/url`;

// Delete entire competitor info including URLs
const deleteCompetitorEndpoint = `/id/:id`;

// Get competitor info
const getCompetitorEndpoint = `/id/:id`;

// Subscribe to competitor updates
const subscribeCompetitorEndpoint = `/:id/subscribe`;

// ==================== Notification ====================

const notificationBaseEndpoint = `${versionStub}/notifications`;

const notifyEndpoint = ``;

// ==================== Workflow ====================

const workflowBaseEndpoint = `${versionStub}/workflows`;

const workflowStatusEndpoint = `/status`;

const diffWorkflowEndpoint = `/diff`;

const reportWorkflowEndpoint = `/report`;

export {
  workflowBaseEndpoint,
  screenshotBaseEndpoint,
  diffBaseEndpoint,
  competitorsBaseEndpoint,
  notificationBaseEndpoint,
  workflowStatusEndpoint,
  diffWorkflowEndpoint,
  reportWorkflowEndpoint,
  subscribeCompetitorEndpoint,
  diffHistoryEndpoint,
  diffCreationEndpoint,
  screenshotContentQueryEndpoint,
  screenshotImageQueryEndpoint,
  screenshotCreationEndpoint,
  reportCreationEndpoint,
  docsStub,
  baseStub,
  createCompetitorEndpoint,
  updateCompetitorEndpoint,
  deleteCompetitorEndpoint,
  getCompetitorEndpoint,
  listCompetitorsEndpoint,
  listCompetitorsURLs,
  listCompetitorsbyHash,
  updateCompetitorURLEndpoint,
  notifyEndpoint,
};
