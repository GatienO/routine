// React Native Worklets reads process.env when its web module is first loaded.
// Metro's production web bundle does not always provide process in the browser.
if (typeof process === 'undefined') {
  globalThis.process = { env: {} };
}

require('expo-router/entry');
