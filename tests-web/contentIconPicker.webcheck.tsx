// @ts-nocheck
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { LIGHT_COLORS } from '../src/constants/theme';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('../src/components/ui/OpenMoji', () => ({ OpenMoji: ({ emoji }) => require('react').createElement(require('react-native').Text, null, emoji) }));
jest.mock('../src/components/ui/ResponsiveOverlay', () => ({
  ResponsiveOverlay: ({ visible, children }) => visible ? require('react').createElement(require('react-native').View, null, children) : null,
}));

import { ContentIconPickerDialog } from '../src/components/ui/ContentIconPicker';

it('finds a new icon outside the first page and returns the selected value', () => {
  const onChange = jest.fn();
  const onClose = jest.fn();
  const screen = render(<ContentIconPickerDialog value="🪥" onChange={onChange} onClose={onClose} colors={LIGHT_COLORS} kind="étape" visible />);

  fireEvent.changeText(screen.getByLabelText('Rechercher une icône'), 'girafe');
  expect(screen.queryByLabelText('brosse à dents')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('girafe'));

  expect(onChange).toHaveBeenCalledWith('🦒');
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('keeps choices beyond the first page reachable and exposes added categories', () => {
  const screen = render(<ContentIconPickerDialog value="🪥" onChange={jest.fn()} onClose={jest.fn()} colors={LIGHT_COLORS} kind="routine" visible />);

  expect(screen.queryByLabelText('botte de marche')).toBeNull();
  fireEvent.press(screen.getByLabelText('Voir plus d’icônes'));
  expect(screen.getByLabelText('botte de marche')).toBeTruthy();

  fireEvent.press(screen.getByLabelText('Catégorie Animaux'));
  expect(screen.getAllByLabelText('girafe').length).toBeGreaterThan(0);
});
