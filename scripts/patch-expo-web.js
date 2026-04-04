/**
 * Expo SDK 55.0.9+ added type="module" to web script tags (fixes import.meta),
 * but `document.currentScript` is always null for ES modules, so the HMR client
 * falls back to the page URL. This crashes Metro's HMR server because the URL
 * has no bundle path.
 *
 * This script patches:
 * 1. react-native's getDevServer.js — to extract the bundle URL from the DOM
 *    when NativeSourceCode returns the page URL (no bundle path).
 * 2. @expo/metro-runtime's getDevServer.ts — same fix for the Expo counterpart.
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

let patched = 0;

// --- Patch 1: react-native getDevServer.js ---
const rnGetDevServer = path.join(
  projectRoot, 'node_modules', 'react-native', 'Libraries', 'Core', 'Devtools', 'getDevServer.js'
);

if (fs.existsSync(rnGetDevServer)) {
  let content = fs.readFileSync(rnGetDevServer, 'utf-8');

  if (content.includes('querySelector')) {
    console.log('[patch-expo-web] react-native getDevServer.js already patched.');
  } else {
    // Replace the scriptUrl resolution to handle web modules
    const oldCode = `  if (_cachedDevServerURL === undefined) {
    const scriptUrl = NativeSourceCode.getConstants().scriptURL;
    const match = scriptUrl.match(/^https?:\\/\\/.*?\\//);
    _cachedDevServerURL = match ? match[0] : null;
    _cachedFullBundleURL = match ? scriptUrl : null;
  }`;

    const newCode = `  if (_cachedDevServerURL === undefined) {
    let scriptUrl = NativeSourceCode.getConstants().scriptURL;
    // For web with type="module" scripts, NativeSourceCode may return the page
    // URL (no bundle path). Fall back to the bundle script tag in the DOM.
    if (typeof document !== 'undefined' && scriptUrl && !scriptUrl.includes('.bundle')) {
      const el = document.querySelector('script[src*=".bundle"]');
      if (el) scriptUrl = el.src;
    }
    const match = scriptUrl.match(/^https?:\\/\\/.*?\\//);
    _cachedDevServerURL = match ? match[0] : null;
    _cachedFullBundleURL = match ? scriptUrl : null;
  }`;

    if (content.includes(oldCode)) {
      content = content.replace(oldCode, newCode);
      fs.writeFileSync(rnGetDevServer, content, 'utf-8');
      console.log('[patch-expo-web] Patched react-native getDevServer.js');
      patched++;
    } else {
      console.log('[patch-expo-web] react-native getDevServer.js pattern not found, skipping.');
    }
  }
}

// --- Patch 2: @expo/metro-runtime getDevServer.ts ---
const expoGetDevServerPaths = [
  path.join(projectRoot, 'node_modules', '@expo', 'metro-runtime', 'src', 'getDevServer.ts'),
  path.join(projectRoot, 'node_modules', 'expo', 'node_modules', '@expo', 'metro-runtime', 'src', 'getDevServer.ts'),
];

const oldFullBundleUrl = `    get fullBundleUrl() {
      if (document?.currentScript && 'src' in document.currentScript) {
        return document.currentScript.src;
      }

      const bundleUrl = new URL(location.href);

      bundleUrl.searchParams.set('platform', 'web');

      return bundleUrl.toString();
    },`;

const newFullBundleUrl = `    get fullBundleUrl() {
      if (document?.currentScript && 'src' in document.currentScript) {
        return document.currentScript.src;
      }

      // type="module" scripts don't set document.currentScript.
      // Find the bundle script tag by its src attribute.
      const el = document.querySelector('script[src*=".bundle"]');
      if (el) return (el as HTMLScriptElement).src;

      const bundleUrl = new URL(location.href);

      bundleUrl.searchParams.set('platform', 'web');

      return bundleUrl.toString();
    },`;

for (const filePath of expoGetDevServerPaths) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf-8');

  if (content.includes('querySelector')) {
    console.log(`[patch-expo-web] ${path.relative(projectRoot, filePath)} already patched.`);
    continue;
  }

  if (!content.includes(oldFullBundleUrl)) {
    console.log(`[patch-expo-web] ${path.relative(projectRoot, filePath)} pattern not found, skipping.`);
    continue;
  }

  content = content.replace(oldFullBundleUrl, newFullBundleUrl);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`[patch-expo-web] Patched ${path.relative(projectRoot, filePath)}`);
  patched++;
}

if (patched === 0) {
  console.log('[patch-expo-web] No files needed patching (or already patched).');
} else {
  console.log(`[patch-expo-web] Done (${patched} file(s) patched).`);
}
