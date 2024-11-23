// logging function
export const _ = (...messages: any[]) => {
  // make json log with timestamp
  const logMessage = {
    timestamp: new Date().toISOString(),
    messages,
  };
  // log to console
  console.log(JSON.stringify(logMessage));
};
