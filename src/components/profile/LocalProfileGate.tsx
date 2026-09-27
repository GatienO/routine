import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button } from '../ui/Button';
import { FONT_SIZE, RADIUS, SHADOWS, SPACING, ThemeColors } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useLocalProfileStore } from '../../stores/localProfileStore';

export function LocalProfileGate() {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useAppTheme();
  const hasHydrated = useLocalProfileStore((state) => state.hasHydrated);
  const profileId = useLocalProfileStore((state) => state.profileId);
  const profileName = useLocalProfileStore((state) => state.profileName);
  const ensureProfileRecord = useLocalProfileStore((state) => state.ensureProfileRecord);
  const initializeProfile = useLocalProfileStore((state) => state.initializeProfile);
  const [draftName, setDraftName] = useState('');

  useEffect(() => {
    if (hasHydrated) {
      ensureProfileRecord();
    }
  }, [ensureProfileRecord, hasHydrated]);

  if (!hasHydrated) {
    return (
      <View style={[styles.loadingBackdrop, { backgroundColor: colors.navigationBackdrop }]}>
        <View style={[styles.loadingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.loadingTitle, { color: colors.text }]}>Chargement du profil local...</Text>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Les données restent sur cet appareil, sans compte ni base de données.
          </Text>
        </View>
      </View>
    );
  }

  if (profileName) {
    return null;
  }

  const trimmedName = draftName.trim();
  const shortProfileId = profileId ? profileId.slice(-6) : 'LOCAL';
  const compact = width < 560;
  const modalWidth = Math.min(Math.max(width - SPACING.lg * 2, 272), 720);

  return (
    <View accessibilityViewIsModal style={styles.gateLayer}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.modalCard, compact && styles.modalCardCompact, { width: modalWidth, backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.badgeRow}>
              <View style={[styles.localBadge, { backgroundColor: colors.timeSoft }]}>
                <Text style={[styles.localBadgeText, { color: colors.time }]}>Profil local</Text>
              </View>
              <Text style={[styles.profileId, { color: colors.textLight }]}>ID {shortProfileId}</Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Créez votre profil sur cet appareil</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Chaque utilisateur conserve ses enfants, routines et récompenses uniquement
              dans son navigateur ou son appareil. Aucune connexion et aucun partage
              automatique.
            </Text>

            <View style={[styles.infoGrid, compact && styles.infoGridCompact]}>
              <InfoCard compact={compact} colors={colors} title="Pas de compte" text="Aucune inscription n'est nécessaire." />
              <InfoCard compact={compact} colors={colors} title="Données locales" text="Tout reste stocké ici, sur cet appareil." />
              <InfoCard compact={compact} colors={colors} title="Espace unique" text="Chaque appareil ou navigateur garde son propre espace." />
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Nom du profil</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Ex : Famille Martin"
              placeholderTextColor={colors.textLight}
              maxLength={40}
              autoFocus={Platform.OS !== 'web'}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (trimmedName) {
                  initializeProfile(trimmedName);
                }
              }}
            />
            <Text style={[styles.hint, { color: colors.textLight }]}>
              Ce nom sert uniquement à identifier ce profil local sur cet appareil.
            </Text>

            <Button
              title="J'ai compris !"
              onPress={() => initializeProfile(trimmedName)}
              variant="primary"
              size="lg"
              color={isDark ? colors.actionSoft : colors.action}
              disabled={!trimmedName}
            />
          </View>
        </ScrollView>
      </Pressable>
    </View>
  );
}

function InfoCard({ colors, title, text, compact }: { colors: ThemeColors; title: string; text: string; compact: boolean }) {
  return (
    <View style={[styles.infoCard, compact && styles.infoCardCompact, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.infoCardTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gateLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    elevation: 2000,
  },
  loadingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    zIndex: 200,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.sm,
    borderWidth: 1,
    ...SHADOWS.md,
  },
  loadingTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  backdrop: {
    flex: 1,
  },
  modalScroll: {
    width: '100%',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  modalCard: {
    maxWidth: 720,
    alignSelf: 'center',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
    borderWidth: 1,
    ...SHADOWS.lg,
  },
  modalCardCompact: {
    padding: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  localBadge: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  localBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  profileId: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  title: {
    fontSize: FONT_SIZE.xl + 2,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  infoGridCompact: {
    flexDirection: 'column',
  },
  infoCard: {
    flexGrow: 1,
    flexBasis: 180,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.xs,
    borderWidth: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  infoCardCompact: {
    width: '100%',
    flexBasis: 'auto',
  },
  infoCardTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  infoCardText: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    lineHeight: 18,
  },
});
