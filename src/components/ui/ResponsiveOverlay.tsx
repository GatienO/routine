import React, { useEffect, useRef } from 'react';
import { Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { X } from 'phosphor-react-native';
import { FONT_SIZE, SHADOWS, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  compact?: boolean;
  centered?: boolean;
};

export function ResponsiveOverlay({ visible, title, subtitle, onClose, children, footer, compact = false, centered = false }: Props) {
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const reducedMotion = useReducedMotionPreference();
  const sidePanel = width >= 760;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!visible || Platform.OS !== 'web' || typeof document === 'undefined') return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onCloseRef.current();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType={reducedMotion ? 'none' : sidePanel ? 'fade' : 'slide'} onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={[styles.safe, sidePanel && centered && styles.centeredSafe, { backgroundColor: colors.overlay }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={onClose} style={styles.backdrop} />
        <View style={[styles.panel, sidePanel ? centered ? styles.centeredPanel : styles.sidePanel : styles.bottomSheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {!sidePanel ? <View style={[styles.handle, { backgroundColor: colors.border }]} /> : null}
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fermer le panneau" onPress={onClose} style={[styles.close, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <X size={20} weight="bold" color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={[styles.content, compact && { paddingHorizontal: 6, paddingBottom: 6, gap: 4 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={[styles.footer, { borderColor: colors.border, backgroundColor: colors.navigationBackdrop }]}>{footer}</View> : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: 'flex-end' },
  centeredSafe: { justifyContent: 'center', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  panel: { maxHeight: '92%', borderWidth: 1, overflow: 'hidden', ...SHADOWS.lg },
  bottomSheet: { width: '100%', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderBottomWidth: 0 },
  sidePanel: { width: 520, maxWidth: '92%', height: '100%', maxHeight: '100%', alignSelf: 'flex-end', borderTopLeftRadius: 28, borderBottomLeftRadius: 28, borderRightWidth: 0 },
  centeredPanel: { width: 640, maxWidth: '92%', maxHeight: '88%', borderRadius: 24 },
  handle: { width: 44, height: 5, borderRadius: 3, alignSelf: 'center', marginTop: SPACING.sm },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, padding: SPACING.lg, paddingBottom: SPACING.md },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { fontSize: FONT_SIZE.xl, lineHeight: 30, fontWeight: '800' },
  subtitle: { fontSize: FONT_SIZE.sm, lineHeight: 20, marginTop: 4 },
  close: { width: 44, height: 44, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.md },
  footer: { borderTopWidth: 1, padding: SPACING.md },
});
