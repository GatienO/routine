import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../ui/Button';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

type FeedbackTone = 'info' | 'success' | 'warning' | 'danger';
type FeedbackActionKind = 'primary' | 'neutral' | 'danger';

export type AppDialogAction = {
  label: string;
  kind?: FeedbackActionKind;
  onPress?: () => void | Promise<void>;
};

export type AppDialogOptions = {
  title: string;
  message?: string;
  tone?: FeedbackTone;
  icon?: string;
  dismissible?: boolean;
  actions?: AppDialogAction[];
};

export type AppToastOptions = {
  title: string;
  message?: string;
  tone?: FeedbackTone;
  icon?: string;
  durationMs?: number;
};

type InternalDialog = AppDialogOptions & { id: string };
type InternalToast = AppToastOptions & { id: string };

type FeedbackController = {
  showDialog: (options: AppDialogOptions) => void;
  showToast: (options: AppToastOptions) => void;
};

let feedbackController: FeedbackController | null = null;
const pendingCalls: Array<() => void> = [];
let feedbackCounter = 0;

function nextFeedbackId() {
  feedbackCounter += 1;
  return `feedback-${feedbackCounter}`;
}

function runWithController(callback: (controller: FeedbackController) => void) {
  if (feedbackController) {
    callback(feedbackController);
    return;
  }

  pendingCalls.push(() => {
    if (feedbackController) callback(feedbackController);
  });
}

export function showAppDialog(options: AppDialogOptions) {
  runWithController((controller) => controller.showDialog(options));
}

export function showAppAlert({
  buttonLabel = 'D accord',
  onPress,
  dismissible = true,
  ...options
}: AppDialogOptions & { buttonLabel?: string; onPress?: () => void | Promise<void> }) {
  showAppDialog({
    ...options,
    dismissible,
    actions: [
      {
        label: buttonLabel,
        kind: 'primary',
        onPress,
      },
    ],
  });
}

export function showAppConfirm({
  title,
  message,
  tone = 'warning',
  icon,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmKind = 'danger',
}: {
  title: string;
  message?: string;
  tone?: FeedbackTone;
  icon?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmKind?: FeedbackActionKind;
}) {
  return new Promise<boolean>((resolve) => {
    showAppDialog({
      title,
      message,
      tone,
      icon,
      dismissible: false,
      actions: [
        {
          label: cancelLabel,
          kind: 'neutral',
          onPress: () => resolve(false),
        },
        {
          label: confirmLabel,
          kind: confirmKind,
          onPress: () => resolve(true),
        },
      ],
    });
  });
}

export function showAppToast(options: AppToastOptions) {
  runWithController((controller) => controller.showToast(options));
}

export function AppFeedbackProvider({ children }: PropsWithChildren) {
  const [activeDialog, setActiveDialog] = useState<InternalDialog | null>(null);
  const [dialogQueue, setDialogQueue] = useState<InternalDialog[]>([]);
  const [activeToast, setActiveToast] = useState<InternalToast | null>(null);
  const [toastQueue, setToastQueue] = useState<InternalToast[]>([]);

  const dialogOpacity = useRef(new Animated.Value(0)).current;
  const dialogTranslateY = useRef(new Animated.Value(18)).current;
  const dialogScale = useRef(new Animated.Value(0.96)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-22)).current;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isClosingDialogRef = useRef(false);
  const isClosingToastRef = useRef(false);

  const controller = useMemo<FeedbackController>(
    () => ({
      showDialog: (options) => {
        const dialog = { id: nextFeedbackId(), ...options };
        setDialogQueue((current) => [...current, dialog]);
      },
      showToast: (options) => {
        const toast = { id: nextFeedbackId(), ...options };
        setToastQueue((current) => [...current, toast]);
      },
    }),
    [],
  );

  useEffect(() => {
    feedbackController = controller;
    while (pendingCalls.length > 0) {
      const callback = pendingCalls.shift();
      callback?.();
    }

    return () => {
      if (feedbackController === controller) {
        feedbackController = null;
      }
    };
  }, [controller]);

  useEffect(() => {
    if (!activeDialog && dialogQueue.length > 0) {
      setActiveDialog(dialogQueue[0]);
      setDialogQueue((current) => current.slice(1));
    }
  }, [activeDialog, dialogQueue]);

  useEffect(() => {
    if (!activeToast && toastQueue.length > 0) {
      setActiveToast(toastQueue[0]);
      setToastQueue((current) => current.slice(1));
    }
  }, [activeToast, toastQueue]);

  useEffect(() => {
    if (!activeDialog) return;

    isClosingDialogRef.current = false;
    dialogOpacity.setValue(0);
    dialogTranslateY.setValue(18);
    dialogScale.setValue(0.96);

    Animated.parallel([
      Animated.timing(dialogOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(dialogTranslateY, {
        toValue: 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(dialogScale, {
        toValue: 1,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeDialog, dialogOpacity, dialogScale, dialogTranslateY]);

  useEffect(() => {
    if (!activeToast) return;

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    isClosingToastRef.current = false;
    toastOpacity.setValue(0);
    toastTranslateY.setValue(-22);

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    toastTimerRef.current = setTimeout(() => {
      dismissToast();
    }, activeToast.durationMs ?? 2600);

    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [activeToast, toastOpacity, toastTranslateY]);

  const dismissDialog = useCallback((afterClose?: () => void) => {
    if (!activeDialog || isClosingDialogRef.current) {
      afterClose?.();
      return;
    }

    isClosingDialogRef.current = true;

    Animated.parallel([
      Animated.timing(dialogOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(dialogTranslateY, {
        toValue: 12,
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(dialogScale, {
        toValue: 0.98,
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      isClosingDialogRef.current = false;
      setActiveDialog(null);
      afterClose?.();
    });
  }, [activeDialog, dialogOpacity, dialogScale, dialogTranslateY]);

  const dismissToast = useCallback(() => {
    if (!activeToast || isClosingToastRef.current) return;

    isClosingToastRef.current = true;

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: -18,
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      isClosingToastRef.current = false;
      setActiveToast(null);
    });
  }, [activeToast, toastOpacity, toastTranslateY]);

  const handleDialogAction = useCallback((action: AppDialogAction) => {
    dismissDialog(() => {
      Promise.resolve(action.onPress?.()).catch(() => {});
    });
  }, [dismissDialog]);

  const activeDialogTone = activeDialog?.tone ?? 'info';
  const activeToastTone = activeToast?.tone ?? 'success';

  return (
    <View style={styles.host}>
      {children}

      {activeToast ? (
        <View pointerEvents="box-none" style={styles.toastViewport}>
          <Animated.View
            style={[
              styles.toastWrap,
              {
                opacity: toastOpacity,
                transform: [{ translateY: toastTranslateY }],
              },
            ]}
          >
            <Pressable
              onPress={dismissToast}
              style={[
                styles.toastCard,
                { borderColor: TONE_STYLES[activeToastTone].accent },
              ]}
            >
              <View
                style={[
                  styles.toastIconWrap,
                  { backgroundColor: TONE_STYLES[activeToastTone].soft },
                ]}
              >
                <Text style={styles.toastIcon}>{activeToast.icon ?? TONE_STYLES[activeToastTone].icon}</Text>
              </View>
              <View style={styles.toastTextWrap}>
                <Text style={styles.toastTitle}>{activeToast.title}</Text>
                {activeToast.message ? (
                  <Text style={styles.toastMessage}>{activeToast.message}</Text>
                ) : null}
              </View>
            </Pressable>
          </Animated.View>
        </View>
      ) : null}

      <Modal
        transparent
        visible={Boolean(activeDialog)}
        animationType="none"
        onRequestClose={() => {
          if (activeDialog?.dismissible !== false) {
            dismissDialog();
          }
        }}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            if (activeDialog?.dismissible !== false) {
              dismissDialog();
            }
          }}
        >
          <Animated.View
            style={[
              styles.dialogCard,
              {
                opacity: dialogOpacity,
                transform: [{ translateY: dialogTranslateY }, { scale: dialogScale }],
              },
            ]}
          >
            {activeDialog ? (
              <>
                <View
                  style={[
                    styles.dialogIconWrap,
                    { backgroundColor: TONE_STYLES[activeDialogTone].soft },
                  ]}
                >
                  <Text style={styles.dialogIcon}>
                    {activeDialog.icon ?? TONE_STYLES[activeDialogTone].icon}
                  </Text>
                </View>

                <Text style={styles.dialogTitle}>{activeDialog.title}</Text>
                {activeDialog.message ? (
                  <Text style={styles.dialogMessage}>{activeDialog.message}</Text>
                ) : null}

                <View
                  style={[
                    styles.dialogActions,
                    activeDialog.actions && activeDialog.actions.length > 2
                      ? styles.dialogActionsStacked
                      : null,
                  ]}
                >
                  {(activeDialog.actions ?? DEFAULT_DIALOG_ACTIONS).map((action) => (
                    <Button
                      key={action.label}
                      title={action.label}
                      onPress={() => handleDialogAction(action)}
                      variant={action.kind === 'neutral' ? 'outline' : 'primary'}
                      size="md"
                      color={action.kind === 'danger' ? COLORS.error : COLORS.secondary}
                      style={styles.dialogActionButton}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const DEFAULT_DIALOG_ACTIONS: AppDialogAction[] = [
  {
    label: 'D accord',
    kind: 'primary',
  },
];

const TONE_STYLES: Record<
  FeedbackTone,
  { icon: string; accent: string; soft: string }
> = {
  info: {
    icon: '💬',
    accent: COLORS.secondary,
    soft: `${COLORS.secondary}20`,
  },
  success: {
    icon: '✨',
    accent: COLORS.success,
    soft: `${COLORS.success}18`,
  },
  warning: {
    icon: '🌤️',
    accent: COLORS.warning,
    soft: '#FFF2D8',
  },
  danger: {
    icon: '🧹',
    accent: COLORS.error,
    soft: '#FFE6E3',
  },
};

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  toastViewport: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 18 : 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    zIndex: 60,
  },
  toastWrap: {
    width: '100%',
    maxWidth: 640,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFFCF8',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    ...SHADOWS.lg,
  },
  toastIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  toastIcon: {
    fontSize: 19,
  },
  toastTextWrap: {
    flex: 1,
    gap: 2,
  },
  toastTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.text,
  },
  toastMessage: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(33, 33, 33, 0.26)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFDF8',
    borderRadius: 28,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  dialogIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogIcon: {
    fontSize: 32,
  },
  dialogTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dialogActions: {
    width: '100%',
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  dialogActionsStacked: {
    flexDirection: 'column',
  },
  dialogActionButton: {
    minWidth: 150,
    flexGrow: 1,
  },
});
