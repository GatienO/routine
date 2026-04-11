import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AvatarConfig } from '../../types';
import { AvatarCharacter } from './AvatarCharacter';
import {
  SKIN_COLORS,
  HAIR_STYLES,
  HAIR_COLORS,
  FACE_STYLES,
  HAT_STYLES,
  HAT_COLORS,
  TOP_STYLES,
  CLOTHING_COLORS,
  BOTTOM_STYLES,
  SHOE_STYLES,
  SHOE_COLORS,
  DOUDOU_STYLES,
  EDITOR_TABS,
  DEFAULT_AVATAR_CONFIG,
} from '../../constants/avatar';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  initialConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onCancel: () => void;
}

export function AvatarEditor({ initialConfig, onSave, onCancel }: Props) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig ?? DEFAULT_AVATAR_CONFIG);
  const [activeTab, setActiveTab] = useState('skin');

  const update = (patch: Partial<AvatarConfig>) =>
    setConfig((c) => ({ ...c, ...patch }));

  return (
    <View style={styles.container}>
      {/* Preview */}
      <View style={styles.preview}>
        <AvatarCharacter config={config} size={140} mode="full" />
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {EDITOR_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Options */}
      <View style={styles.optionsContent}>
        {activeTab === 'skin' && (
          <ColorGrid
            colors={SKIN_COLORS}
            selected={config.skinColor}
            onSelect={(c) => update({ skinColor: c })}
            size={48}
          />
        )}

        {activeTab === 'hair' && (
          <>
            <Text style={styles.sectionLabel}>Style</Text>
            <StyleGrid
              items={HAIR_STYLES}
              selected={config.hair}
              onSelect={(id) => update({ hair: id })}
            />
            <Text style={styles.sectionLabel}>Couleur</Text>
            <ColorGrid
              colors={HAIR_COLORS}
              selected={config.hairColor}
              onSelect={(c) => update({ hairColor: c })}
            />
          </>
        )}

        {activeTab === 'face' && (
          <StyleGrid
            items={FACE_STYLES}
            selected={config.face}
            onSelect={(id) => update({ face: id })}
          />
        )}

        {activeTab === 'hat' && (
          <>
            <Text style={styles.sectionLabel}>Style</Text>
            <StyleGrid
              items={HAT_STYLES}
              selected={config.hat}
              onSelect={(id) => update({ hat: id })}
            />
            {config.hat !== 'none' && config.hat !== 'crown' && (
              <>
                <Text style={styles.sectionLabel}>Couleur</Text>
                <ColorGrid
                  colors={HAT_COLORS}
                  selected={config.hatColor}
                  onSelect={(c) => update({ hatColor: c })}
                />
              </>
            )}
          </>
        )}

        {activeTab === 'top' && (
          <>
            <Text style={styles.sectionLabel}>Style</Text>
            <StyleGrid
              items={TOP_STYLES}
              selected={config.top}
              onSelect={(id) => update({ top: id })}
            />
            <Text style={styles.sectionLabel}>Couleur</Text>
            <ColorGrid
              colors={CLOTHING_COLORS}
              selected={config.topColor}
              onSelect={(c) => update({ topColor: c })}
            />
          </>
        )}

        {activeTab === 'bottom' && (
          <>
            {config.top === 'dress' ? (
              <Text style={styles.infoText}>
                La robe couvre déjà le bas 👗
              </Text>
            ) : (
              <>
                <Text style={styles.sectionLabel}>Style</Text>
                <StyleGrid
                  items={BOTTOM_STYLES}
                  selected={config.bottom}
                  onSelect={(id) => update({ bottom: id })}
                />
                <Text style={styles.sectionLabel}>Couleur</Text>
                <ColorGrid
                  colors={CLOTHING_COLORS}
                  selected={config.bottomColor}
                  onSelect={(c) => update({ bottomColor: c })}
                />
              </>
            )}
          </>
        )}

        {activeTab === 'shoes' && (
          <>
            <Text style={styles.sectionLabel}>Style</Text>
            <StyleGrid
              items={SHOE_STYLES}
              selected={config.shoes}
              onSelect={(id) => update({ shoes: id })}
            />
            <Text style={styles.sectionLabel}>Couleur</Text>
            <ColorGrid
              colors={SHOE_COLORS}
              selected={config.shoesColor}
              onSelect={(c) => update({ shoesColor: c })}
            />
          </>
        )}

        {activeTab === 'doudou' && (
          <>
            <Text style={styles.sectionLabel}>Choisir un doudou</Text>
            <StyleGrid
              items={DOUDOU_STYLES}
              selected={config.doudou ?? 'none'}
              onSelect={(id) => update({ doudou: id === 'none' ? undefined : id })}
            />
            <Text style={styles.infoText}>
              Le doudou s'affichera quand l'enfant dort avec un pyjama 🌙
            </Text>
          </>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(config)}>
          <Text style={styles.saveText}>✓ Valider</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── Sub-components ── */

function ColorGrid({ colors, selected, onSelect, size = 38 }: {
  colors: { id: string; color: string; label: string }[];
  selected: string;
  onSelect: (color: string) => void;
  size?: number;
}) {
  return (
    <View style={styles.grid}>
      {colors.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={[
            styles.colorCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: c.color,
              borderColor: selected === c.color ? COLORS.secondary : '#DDD',
              borderWidth: selected === c.color ? 3 : 2,
            },
          ]}
          onPress={() => onSelect(c.color)}
        />
      ))}
    </View>
  );
}

function StyleGrid({ items, selected, onSelect }: {
  items: { id: string; label: string; emoji: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.styleBtn,
            selected === item.id && styles.styleBtnActive,
          ]}
          onPress={() => onSelect(item.id)}
        >
          <Text style={styles.styleEmoji}>{item.emoji}</Text>
          <Text style={[
            styles.styleLabel,
            selected === item.id && styles.styleLabelActive,
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ── Styles ── */

const styles = StyleSheet.create({
  container: {},
  preview: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: '#FBF6EF',
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E9DED0',
    ...SHADOWS.sm,
  },
  tabs: {
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFFDFC',
    borderWidth: 1,
    borderColor: '#E8DED2',
    minWidth: 62,
  },
  tabActive: {
    backgroundColor: '#D7F2EC',
    borderColor: COLORS.secondary,
  },
  tabEmoji: { fontSize: 20 },
  tabLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: { color: COLORS.secondary },
  optionsContent: { paddingVertical: SPACING.sm },
  sectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  colorCircle: {
    ...SHADOWS.sm,
  },
  styleBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFFDFC',
    borderWidth: 2,
    borderColor: '#EFE5DA',
    minWidth: 72,
  },
  styleBtnActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary + '15',
  },
  styleEmoji: { fontSize: 24 },
  styleLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  styleLabelActive: { color: COLORS.secondary },
  infoText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.md,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  cancelText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  saveBtn: {
    flex: 2,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.secondary,
  },
  saveText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#FFF',
  },
});
