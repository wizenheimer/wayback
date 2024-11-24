const version = "/api/v1";

const diffHistoryEndpoint = `${version}/diff/history`;

const diffCreationEndpoint = `${version}/diff/create`;

const screenshotContentQueryEndpoint = `${version}/content/:hash/:date`;

const screenshotImageQueryEndpoint = `${version}/screenshot/:hash/:date`;

const screenshotCreationEndpoint = `${version}/screenshot`;

const reportCreationEndpoint = `${version}/report`;

export {
  diffHistoryEndpoint,
  diffCreationEndpoint,
  screenshotContentQueryEndpoint,
  screenshotImageQueryEndpoint,
  screenshotCreationEndpoint,
  reportCreationEndpoint,
};
