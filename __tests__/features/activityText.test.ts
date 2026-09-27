import { formatActivityText } from '../../src/features/activities/format-activity-text';

describe('formatActivityText', () => {
  test('restores common French accents in legacy display copy', () => {
    expect(formatActivityText('Creer une idee a partir de regles tres simples.')).toBe(
      'Créer une idée à partir de règles très simples.',
    );
    expect(formatActivityText('Faire des poses inspirees et garder l equilibre.')).toBe(
      'Faire des poses inspirées et garder l équilibre.',
    );
  });
});
