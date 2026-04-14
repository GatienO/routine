import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../ui/Button';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { useLocalProfileStore } from '../../stores/localProfileStore';

export function LocalProfileGate() {
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
      <View style={styles.loadingBackdrop}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>Chargement du profil local...</Text>
          <Text style={styles.loadingText}>
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

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => undefined}>
      <Pressable style={styles.backdrop}>
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalCard}>
            <View style={styles.badgeRow}>
              <View style={styles.localBadge}>
                <Text style={styles.localBadgeText}>Profil local</Text>
              </View>
              <Text style={styles.profileId}>ID {shortProfileId}</Text>
            </View>

            <Text style={styles.title}>Créez votre profil sur cet appareil</Text>
            <Text style={styles.subtitle}>
              Chaque utilisateur conserve ses enfants, routines et récompenses uniquement
              dans son navigateur ou son appareil. Aucune connexion et aucun partage
              automatique.
            </Text>

            <View style={styles.infoGrid}>
              <InfoCard title="Pas de compte" text="Aucune inscription n'est nécessaire." />
              <InfoCard title="Données locales" text="Tout reste stocké ici, sur cet appareil." />
              <InfoCard title="Profil unique" text="Chaque appareil ou navigateur garde son propre espace." />
            </View>

            <Text style={styles.label}>Nom du profil</Text>
            <TextInput
              style={styles.input}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Ex : Famille Martin"
              placeholderTextColor={COLORS.textLight}
              maxLength={40}
              autoFocus={Platform.OS !== 'web'}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (trimmedName) {
                  initializeProfile(trimmedName);
                }
              }}
            />
            <Text style={styles.hint}>
              Ce nom sert uniquement à identifier ce profil local sur cet appareil.
            </Text>

            <Button
              title="J'ai compris !"
              onPress={() => initializeProfile(trimmedName)}
              variant="primary"
              size="lg"
              color={COLORS.secondary}
              disabled={!trimmedName}
            />
          </View>
        </ScrollView>
      </Pressable>
    </Modal>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <Text style={styles.infoCardText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 248, 240, 0.96)',
    padding: SPACING.lg,
    zIndex: 200,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  loadingTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    padding: SPACING.lg,
  },
  modalScroll: {
    width: '100%',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
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
    backgroundColor: `${COLORS.secondary}20`,
  },
  localBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  profileId: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  title: {
    fontSize: FONT_SIZE.xl + 2,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  infoCard: {
    flexGrow: 1,
    flexBasis: 180,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoCardTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.text,
  },
  infoCardText: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    lineHeight: 18,
    color: COLORS.textLight,
  },
});
