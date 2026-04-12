import React, { useMemo } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  showAppAlert,
  showAppToast,
} from '../feedback/AppFeedbackProvider';
import { OpenMoji } from '../ui/OpenMoji';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { Routine } from '../../types';
import { createRoutineShareArtifacts } from '../../services/sharing';

export function RoutineShareModal({
  visible,
  routine,
  onClose,
}: {
  visible: boolean;
  routine: Routine | null;
  onClose: () => void;
}) {
  const artifacts = useMemo(
    () => (routine ? createRoutineShareArtifacts(routine) : null),
    [routine],
  );

  const copyValue = async (label: string, value: string) => {
    try {
      await Clipboard.setStringAsync(value);
      showAppToast({
        title: 'Copie',
        message: `${label} copie dans le presse-papiers.`,
        tone: 'success',
        icon: '📋',
      });
    } catch {
      showAppAlert({
        title: 'Erreur',
        message: `Impossible de copier ${label.toLowerCase()}.`,
        tone: 'danger',
        icon: '⚠️',
      });
    }
  };

  const handleShare = async () => {
    if (!artifacts || !routine) return;

    try {
      await Share.share({
        title: routine.name,
        message: artifacts.shareMessage,
      });
    } catch {
      await copyValue('Le message de partage', artifacts.shareMessage);
    }
  };

  const handleExportJson = async () => {
    if (!artifacts) return;

    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const blob = new Blob([artifacts.json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = artifacts.fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        showAppToast({
          title: 'JSON telecharge',
          message: `Le fichier ${artifacts.fileName} a ete telecharge.`,
          tone: 'success',
          icon: '💾',
        });
        return;
      }

      if (!FileSystem.documentDirectory) {
        throw new Error('No document directory');
      }

      const fileUri = `${FileSystem.documentDirectory}${artifacts.fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, artifacts.json, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Clipboard.setStringAsync(fileUri);
      showAppToast({
        title: 'JSON exporte',
        message: `Le fichier ${artifacts.fileName} a ete cree localement. Le chemin a ete copie dans le presse-papiers.`,
        tone: 'success',
        icon: '💾',
      });
    } catch {
      showAppAlert({
        title: 'Erreur',
        message: 'Impossible d exporter le fichier JSON.',
        tone: 'danger',
        icon: '⚠️',
      });
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
          {routine && artifacts ? (
            <>
              <View style={styles.header}>
                <View style={styles.headerIcon}>
                  <OpenMoji emoji={routine.icon} size={36} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>Partager une routine</Text>
                  <Text style={styles.subtitle}>{routine.name}</Text>
                </View>
              </View>

              {!artifacts.isLinkPractical ? (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    Le lien est long pour un partage pratique. Le code, le QR payload et le JSON
                    local restent disponibles.
                  </Text>
                </View>
              ) : null}

              <ScrollView style={styles.sections} contentContainerStyle={styles.sectionsContent}>
                <ShareValueCard
                  title="Lien d'import"
                  value={artifacts.link}
                  onCopy={() => copyValue('Le lien', artifacts.link)}
                />
                <ShareValueCard
                  title="Code import"
                  value={artifacts.code}
                  onCopy={() => copyValue('Le code', artifacts.code)}
                />
                <ShareValueCard
                  title="Payload QR"
                  value={artifacts.qrPayload}
                  onCopy={() => copyValue('Le payload QR', artifacts.qrPayload)}
                />
              </ScrollView>

              <View style={styles.actions}>
                <Button
                  title="Partager"
                  onPress={handleShare}
                  variant="primary"
                  size="lg"
                  color={COLORS.secondary}
                />
                <Button
                  title="Exporter JSON"
                  onPress={handleExportJson}
                  variant="outline"
                  size="md"
                  color={COLORS.secondaryDark}
                />
                <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.85}>
                  <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ShareValueCard({
  title,
  value,
  onCopy,
}: {
  title: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <Card style={styles.valueCard}>
      <View style={styles.valueHeader}>
        <Text style={styles.valueTitle}>{title}</Text>
        <TouchableOpacity onPress={onCopy} style={styles.copyButton} activeOpacity={0.85}>
          <Text style={styles.copyButtonText}>Copier</Text>
        </TouchableOpacity>
      </View>
      <Text selectable style={styles.valueText}>
        {value}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 32, 46, 0.34)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '88%',
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  warningBox: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: '#F1C27D',
  },
  warningText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#8A5600',
    lineHeight: 20,
  },
  sections: {
    flexGrow: 0,
  },
  sectionsContent: {
    gap: SPACING.md,
  },
  valueCard: {
    gap: SPACING.sm,
  },
  valueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  valueTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  copyButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceSecondary,
  },
  copyButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  valueText: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  actions: {
    gap: SPACING.sm,
  },
  closeButton: {
    alignSelf: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  closeButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
});
