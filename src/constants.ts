// src/constants.ts

const docsStub = "/docs";

const baseStub = "/api";

const versionStub = `${baseStub}/v1`;

// ==================== Screenshots ====================

// Get the content of a screenshot
const screenshotContentQueryEndpoint = `${versionStub}/content/:hash/:weekNumber/:runId`;

// Get the image of a screenshot
const screenshotImageQueryEndpoint = `${versionStub}/screenshot/:hash/:weekNumber/:runId`;

// Create a new screenshot
const screenshotCreationEndpoint = `${versionStub}/screenshot`;

// ==================== Diff ====================

// Get the history of a diff
const diffHistoryEndpoint = `${versionStub}/diff/history`;

// Create a new diff
const diffCreationEndpoint = `${versionStub}/diff/create`;

// ==================== Reports ====================

// Create a new report
const reportCreationEndpoint = `${versionStub}/report`;

// ==================== Competitors Aggregate ====================

// Create a new competitor
const createCompetitorEndpoint = `${versionStub}/competitors`;

// List all competitors
const listCompetitorsEndpoint = `${versionStub}/competitors`;

// List competitor URLs with pagination and optional domain hash filter
const listCompetitorsURLs = `${versionStub}/competitors/url`;

// List competitor URLs by hash
const listCompetitorsbyHash = `${versionStub}/competitors/hash/:hash`;

// ==================== Competitors Individual ====================

// Update any property in an existing competitor
const updateCompetitorEndpoint = `${versionStub}/competitors/id/:id`;

// Update the URL of a competitor
const updateCompetitorURLEndpoint = `${versionStub}/competitors/id/:id/url`;

// Delete entire competitor info including URLs
const deleteCompetitorEndpoint = `${versionStub}/competitors/id/:id`;

// Get competitor info
const getCompetitorEndpoint = `${versionStub}/competitors/id/:id`;

// Subscribe to competitor updates
const subscribeCompetitorEndpoint = `${versionStub}/competitors/:id/subscribe`;

// ==================== Notification ====================

const notifyEndpoint = `${versionStub}/notify`;

export {
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
