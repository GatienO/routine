jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

import { useLocalProfileStore } from '../../src/stores/localProfileStore';

beforeEach(() => {
  useLocalProfileStore.setState({
    profileId: null,
    profileName: '',
    createdAt: null,
    tutorialPromptPending: true,
    tutorialCompletedAt: null,
    hasHydrated: true,
  });
});

describe('localProfileStore', () => {
  test('initializeProfile creates a unique local profile', () => {
    useLocalProfileStore.getState().initializeProfile('Famille Martin');

    const state = useLocalProfileStore.getState();
    expect(state.profileName).toBe('Famille Martin');
    expect(state.profileId).toMatch(/^local-/);
    expect(state.createdAt).toBeTruthy();
  });

  test('renameProfile updates only the local label', () => {
    useLocalProfileStore.getState().initializeProfile('Maison Soleil');
    const initialId = useLocalProfileStore.getState().profileId;

    useLocalProfileStore.getState().renameProfile('Maison Arc-en-ciel');
    const state = useLocalProfileStore.getState();

    expect(state.profileName).toBe('Maison Arc-en-ciel');
    expect(state.profileId).toBe(initialId);
  });

  test('ensureProfileRecord backfills identifier without forcing a name', () => {
    useLocalProfileStore.getState().ensureProfileRecord();

    const state = useLocalProfileStore.getState();
    expect(state.profileId).toMatch(/^local-/);
    expect(state.createdAt).toBeTruthy();
    expect(state.profileName).toBe('');
  });

  test('keeps dismissal distinct from completing the guide', () => {
    useLocalProfileStore.getState().dismissTutorialPrompt();
    expect(useLocalProfileStore.getState().tutorialPromptPending).toBe(false);
    expect(useLocalProfileStore.getState().tutorialCompletedAt).toBeNull();

    useLocalProfileStore.getState().completeTutorial();
    expect(useLocalProfileStore.getState().tutorialCompletedAt).toBeTruthy();
  });
});
