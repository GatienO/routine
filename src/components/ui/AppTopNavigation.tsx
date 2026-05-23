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
  CalendarBlank,
  ChartBar,
  CloudSun,
  Gear,
  Gift,
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

type NavigationKey = 'child' | 'parent';

export function AppTopNavigation({ title, onBack, style }: AppTopNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const isParentMode = useAppStore((state) => state.isParentMode);
  const selectChild = useAppStore((state) => state.selectChild);
  const drawerWidth = Math.min(width * 0.84, 340);

  const activeKey: NavigationKey =
    pathname.startsWith('/parent') || pathname.startsWith('/pin')
      ? 'parent'
      : 'child';

  const navigateChild = () => {
    setMenuOpen(false);
    selectChild(null);
    router.replace('/child');
  };

  const navigateParent = () => {
    setMenuOpen(false);
    router.replace((isParentMode ? '/parent' : parentPinRoute('/parent')) as any);
  };

  const navigateChildRoute = (href: string) => {
    setMenuOpen(false);
    selectChild(null);
    router.push(href as any);
  };

  const navigateParentRoute = (href: string) => {
    setMenuOpen(false);
    router.push((isParentMode ? href : parentPinRoute(href)) as any);
  };

  const parentPinRoute = (redirect: string) => ({
    pathname: '/pin',
    params: { redirect },
  });

  const renderMenuButton = () => (
    <TouchableOpacity
      onPress={() => setMenuOpen(true)}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel="Ouvrir le menu de navigation"
      accessibilityState={{ expanded: menuOpen }}
      hitSlop={6}
      style={styles.menuButton}
    >
      <TfiMenu size={22} color="#54727D" />
    </TouchableOpacity>
  );

  const renderBackButton = () => (
    <TouchableOpacity
      onPress={onBack}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel="Retour"
      hitSlop={6}
      style={styles.backButton}
    >
      <ArrowLeft size={22} weight="bold" color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <View style={styles.navSlot}>{onBack ? renderBackButton() : <View style={styles.sideSpacer} />}</View>
        {title ? <Text style={styles.screenTitle}>{title}</Text> : <View style={styles.titleSpacer} />}
        <View style={[styles.navSlot, styles.navSlotRight]}>{renderMenuButton()}</View>
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
                label="Calendrier enfant"
                onPress={() => navigateChildRoute('/child/calendar')}
                icon={<CalendarBlank size={20} weight="bold" color={COLORS.textSecondary} />}
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
                label="Calendrier"
                onPress={() => navigateParentRoute('/parent/calendar')}
                icon={<CalendarBlank size={20} weight="bold" color={COLORS.textSecondary} />}
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
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  navSlot: {
    width: TOUCH.minHeight,
    height: TOUCH.minHeight,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  navSlotRight: {
    alignItems: 'flex-end',
  },
  titleSpacer: {
    flex: 1,
  },
  sideSpacer: {
    width: TOUCH.minHeight,
    height: TOUCH.minHeight,
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
  backButton: {
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
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: 'rgb(33, 39, 48)',
    letterSpacing: 0.2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 39, 49, 0.7)',
    alignItems: 'flex-end',
  },
  drawer: {
    height: '100%',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl + 6,
    borderBottomLeftRadius: RADIUS.xl + 6,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderLeftWidth: 1,
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
