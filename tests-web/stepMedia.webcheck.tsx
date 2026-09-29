// @ts-nocheck
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StepMedia } from '../src/features/routines/components/StepMedia';
import { LIGHT_COLORS } from '../src/constants/theme';

jest.mock('../src/components/ui/OpenMoji', () => ({ OpenMoji: ({ emoji }) => require('react').createElement(require('react-native').Text, null, emoji) }));

it('keeps an imported step identifiable while its image loads or fails', () => {
  const screen = render(<StepMedia uri="https://example.invalid/photo.png" icon="🦒" title="Je prépare mon sac" mobile colors={LIGHT_COLORS} />);
  expect(JSON.stringify(screen.toJSON())).toContain('🦒');

  fireEvent(screen.getByLabelText('Illustration de Je prépare mon sac'), 'error');
  expect(JSON.stringify(screen.toJSON())).toContain('Image indisponible');
  expect(JSON.stringify(screen.toJSON())).toContain('🦒');
});
