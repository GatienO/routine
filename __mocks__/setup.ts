// Suppress expo winter runtime import issues in test environment
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });
