const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix: Metro's HMR server crashes when the web client sends the page URL
// (empty path) instead of the bundle URL. Rewrite those URLs so
// jsc-safe-url doesn't throw "empty path" errors.
const origRewrite = config.server?.rewriteRequestUrl ?? ((url) => url);
config.server = {
  ...config.server,
  rewriteRequestUrl(url) {
    const rewritten = origRewrite(url);
    if (/^https?:\/\//.test(rewritten) && rewritten.includes('platform=web')) {
      const u = new URL(rewritten);
      const looksLikeBundleRequest =
        u.pathname.endsWith('.bundle') ||
        u.pathname.includes('/node_modules/') ||
        u.pathname.includes('/assets/') ||
        u.pathname.includes('/@fs/');

      // When the web client sends the current page URL such as `/` or `/child`
      // instead of the actual bundle URL, point Metro back to Expo Router's entry.
      if (!looksLikeBundleRequest) {
        u.pathname = '/node_modules/expo-router/entry.bundle';
        return u.toString();
      }
    }
    return rewritten;
  },
};

module.exports = config;
