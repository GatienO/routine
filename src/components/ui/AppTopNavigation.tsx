import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { TfiMenu } from 'react-icons/tfi';
import {
  ArrowLeft,
  Baby,
  Books,
  ChartBar,
  CloudSun,
  Gear,
  Gift,
  House,
  PlusCircle,
  Trash,
  UploadSimple,
  UsersThree,
  X,
} from 'phosphor-react-native';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING, TOUCH } from '../../constants/theme';
import { useAppStore } from '../../stores/appStore';

type AppTopNavigationProps = {
  title?: string;
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
};

type NavigationKey = 'home' | 'child' | 'parent';

export function AppTopNavigation({ onBack, style }: AppTopNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const isParentMode = useAppStore((state) => state.isParentMode);
  const selectChild = useAppStore((state) => state.selectChild);
  const drawerWidth = Math.min(width * 0.84, 340);

  const activeKey: NavigationKey =
    pathname.startsWith('/child')
      ? 'child'
      : pathname.startsWith('/parent') || pathname.startsWith('/pin')
        ? 'parent'
        : 'home';

  const navigateHome = () => {
    setMenuOpen(false);
    router.replace('/');
  };

  const navigateChild = () => {
    setMenuOpen(false);
    selectChild(null);
    router.replace('/child');
  };

  const navigateParent = () => {
    setMenuOpen(false);
    router.replace(isParentMode ? '/parent' : '/pin');
  };

  const navigateParentRoute = (href: string) => {
    setMenuOpen(false);
    router.push((isParentMode ? href : '/pin') as any);
  };

  const navigateBack = () => {
    setMenuOpen(false);
    onBack?.();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le menu de navigation"
          accessibilityState={{ expanded: menuOpen }}
          hitSlop={6}
          style={styles.menuButton}
        >
          <TfiMenu size={22} color={COLORS.text} />
        </TouchableOpacity>

      </View>

      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <Pressable
            style={[styles.drawer, { width: drawerWidth }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerEyebrow}>Navigation</Text>
                <Text style={styles.drawerTitle}>Routine</Text>
              </View>
              <TouchableOpacity
                onPress={() => setMenuOpen(false)}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel="Fermer le menu"
                hitSlop={8}
                style={styles.closeButton}
              >
                <X size={22} weight="bold" color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.drawerItems} showsVerticalScrollIndicator={false}>
              {onBack ? (
                <NavigationPill
                  label="Retour"
                  onPress={navigateBack}
                  icon={<ArrowLeft size={20} weight="bold" color={COLORS.textSecondary} />}
                  muted
                />
              ) : null}

              <NavigationPill
                label="Accueil"
                onPress={navigateHome}
                active={activeKey === 'home'}
                icon={
                  <House
                    size={20}
                    weight={activeKey === 'home' ? 'fill' : 'bold'}
                    color={activeKey === 'home' ? COLORS.secondaryDark : COLORS.textSecondary}
                  />
                }
              />
              <NavigationPill
                label="Espace enfant"
                onPress={navigateChild}
                active={activeKey === 'child'}
                icon={
                  <Baby
                    size={20}
                    weight={activeKey === 'child' ? 'fill' : 'bold'}
                    color={activeKey === 'child' ? COLORS.secondaryDark : COLORS.textSecondary}
                  />
                }
              />
              <NavigationPill
                label="Espace parent"
                onPress={navigateParent}
                active={activeKey === 'parent'}
                icon={
                  <UsersThree
                    size={20}
                    weight={activeKey === 'parent' ? 'fill' : 'bold'}
                    color={activeKey === 'parent' ? COLORS.secondaryDark : COLORS.textSecondary}
                  />
                }
              />

              <View style={styles.submenu}>
                <Text style={styles.submenuTitle}>Routines</Text>
                <NavigationPill
                  label="Creer"
                  onPress={() => navigateParentRoute('/parent/add-routine')}
                  icon={<PlusCircle size={20} weight="bold" color={COLORS.textSecondary} />}
                  nested
                />
                <NavigationPill
                  label="Catalogue"
                  onPress={() => navigateParentRoute('/parent/catalog')}
                  icon={<Books size={20} weight="bold" color={COLORS.textSecondary} />}
                  nested
                />
                <NavigationPill
                  label="Importer"
                  onPress={() => navigateParentRoute('/parent/import')}
                  icon={<UploadSimple size={20} weight="bold" color={COLORS.textSecondary} />}
                  nested
                />
              </View>

              <NavigationPill
                label="Config des enfants"
                onPress={() => navigateParentRoute('/parent/children')}
                icon={<Gear size={20} weight="bold" color={COLORS.textSecondary} />}
              />
              <NavigationPill
                label="Recompenses"
                onPress={() => navigateParentRoute('/parent/rewards')}
                icon={<Gift size={20} weight="bold" color={COLORS.textSecondary} />}
              />
              <NavigationPill
                label="Statistiques"
                onPress={() => navigateParentRoute('/parent/stats')}
                icon={<ChartBar size={20} weight="bold" color={COLORS.textSecondary} />}
              />
              <NavigationPill
                label="Corbeille"
                onPress={() => navigateParentRoute('/parent/trash')}
                icon={<Trash size={20} weight="bold" color={COLORS.textSecondary} />}
              />
              <NavigationPill
                label="Config meteo"
                onPress={() => navigateParentRoute('/parent/weather')}
                icon={<CloudSun size={20} weight="bold" color={COLORS.textSecondary} />}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function NavigationPill({
  label,
  icon,
  active,
  muted,
  nested,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  muted?: boolean;
  nested?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={[
        styles.pill,
        active && styles.pillActive,
        muted && styles.pillMuted,
        nested && styles.pillNested,
      ]}
    >
      {icon}
      <Text style={[styles.pillText, active && styles.pillTextActive, muted && styles.pillTextMuted]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  topRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuButton: {
    width: TOUCH.minHeight,
    height: TOUCH.minHeight,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 39, 48, 0.38)',
    alignItems: 'flex-start',
  },
  drawer: {
    height: '100%',
    backgroundColor: COLORS.surface,
    borderTopRightRadius: RADIUS.xl + 6,
    borderBottomRightRadius: RADIUS.xl + 6,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  drawerEyebrow: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: COLORS.secondaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  drawerTitle: {
    marginTop: 2,
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
  },
  closeButton: {
    width: TOUCH.minHeight,
    height: TOUCH.minHeight,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  drawerItems: {
    gap: SPACING.sm,
  },
  submenu: {
    gap: SPACING.xs,
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  submenuTitle: {
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  pill: {
    minHeight: TOUCH.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: 'transparent',
  },
  pillActive: {
    backgroundColor: COLORS.secondarySoft,
  },
  pillMuted: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  pillNested: {
    marginLeft: SPACING.md,
    minHeight: TOUCH.minHeight - 6,
    backgroundColor: COLORS.cardHighlight,
  },
  pillText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: COLORS.secondaryDark,
  },
  pillTextMuted: {
    color: COLORS.textSecondary,
  },
});
