import { ICON_PICKER_EMOJIS, ICON_PICKER_GROUPS } from '../../src/constants/icons';
import { getIconSearchLabel, searchContentIcons } from '../../src/utils/contentIconSearch';

describe('recherche des pictogrammes de routine', () => {
  it('rend toute la bibliothèque accessible et conserve les groupes', () => {
    expect(searchContentIcons('')).toEqual(ICON_PICKER_EMOJIS);
    expect(ICON_PICKER_EMOJIS.length).toBeGreaterThan(250);
    for (const group of ICON_PICKER_GROUPS) {
      expect(searchContentIcons('', group.key)).toEqual(group.emojis);
    }
  });

  it('retrouve un pictogramme par nom français et par catégorie', () => {
    expect(searchContentIcons('dent')).toContain('🪥');
    expect(searchContentIcons('ecole')).toContain('🎒');
    expect(searchContentIcons('soleil')).toContain('☀️');
    expect(searchContentIcons('anniversaire')).toContain('🎂');
    expect(searchContentIcons('medecin')).toContain('🩺');
    expect(searchContentIcons('introuvable')).toEqual([]);
  });

  it('fournit un libellé pour les anciennes valeurs', () => {
    expect(getIconSearchLabel('🪥')).toBe('brosse à dents');
    expect(getIconSearchLabel('🦄')).toBe('licorne');
    expect(getIconSearchLabel('🛸')).toContain('🛸');
  });
});
