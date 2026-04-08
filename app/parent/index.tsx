import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { useAppStore } from '../../src/stores/appStore';
import { useWeatherStore } from '../../src/stores/weatherStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { RoutineCard } from '../../src/components/routine/RoutineCard';
import { DraggableList } from '../../src/components/ui/DraggableList';
import { StarCounter } from '../../src/components/rewards/Counters';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';
import { HomeIcon, CatalogIcon, AddIcon, GiftIcon, MergeIcon, StatsIcon, ImportIcon } from '../../src/components/ui/ModernIcons';

export default function ParentDashboard() {
  const router = useRouter();
  const { children } = useChildrenStore();
  const { routines, toggleRoutine, reorderRoutines, removeRoutine, duplicateRoutine } = useRoutineStore();
  const { getRewards } = useRewardStore();
  const { setParentMode, selectChild, weatherCity, useGeolocation, setWeatherCity, setUseGeolocation } = useAppStore();
  const { refresh: refreshWeather } = useWeatherStore();
  const [cityInput, setCityInput] = useState(weatherCity);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeSelection, setMergeSelection] = useState<string[]>([]);

  const handleSaveCity = () => {
    const trimmed = cityInput.trim();
    setWeatherCity(trimmed);
    // Clear cache so next load fetches new city
    refreshWeather({ cityName: trimmed, useGeolocation });
    Alert.alert('✅ Ville enregistrée', trimmed ? `Météo pour : ${trimmed}` : 'Météo par défaut (Paris)');
  };

  const handleToggleGeo = (value: boolean) => {
    setUseGeolocation(value);
    if (value) {
      refreshWeather({ useGeolocation: true });
    }
  };

  const handleLogout = () => {
    router.replace('/');
  };

  // Group routines by child for reorder & display
  const routinesByChild = useMemo(() => {
    const map: Record<string, typeof routines> = {};
    routines.forEach((r) => {
      if (!map[r.childId]) map[r.childId] = [];
      map[r.childId].push(r);
    });
    return map;
  }, [routines]);

  const toggleMergeSelect = (id: string) => {
    setMergeSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDeleteRoutine = (routine: typeof routines[0]) => {
    Alert.alert(
      'Supprimer',
      `Supprimer la routine « ${routine.name} » ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => removeRoutine(routine.id) },
      ],
    );
  };

  const handleDuplicateRoutine = (routine: typeof routines[0]) => {
    duplicateRoutine(routine.id, routine.childId);
    Alert.alert('✅ Routine dupliquée !');
  };

  const handleMerge = () => {
    if (mergeSelection.length < 2) {
      Alert.alert('Sélection', 'Sélectionnez au moins 2 routines à fusionner.');
      return;
    }
    const first = routines.find((r) => r.id === mergeSelection[0]);
    if (!first) return;
    const allSameChild = mergeSelection.every(
      (id) => routines.find((r) => r.id === id)?.childId === first.childId,
    );
    if (!allSameChild) {
      Alert.alert('Erreur', 'Les routines doivent appartenir au même enfant.');
      return;
    }
    // Navigate to add-routine with merge params
    router.push({
      pathname: '/parent/add-routine',
      params: { mergeIds: mergeSelection.join(',') },
    });
    setMergeMode(false);
    setMergeSelection([]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>👨‍👩‍👧 Espace Parent</Text>
            <Text style={styles.subtitle}>
              {children.length} enfant{children.length !== 1 ? 's' : ''} · {routines.length} routine{routines.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.homeButton}>
            <HomeIcon size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Children Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Enfants</Text>
            <Button
              title="+ Ajouter"
              onPress={() => router.push('/parent/add-child')}
              variant="ghost"
              size="sm"
              color={COLORS.secondary}
            />
          </View>

          {children.length === 0 ? (
            <Card>
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>👶</Text>
                <Text style={styles.emptyText}>Ajoutez votre premier enfant</Text>
                <Button
                  title="Ajouter un enfant"
                  onPress={() => router.push('/parent/add-child')}
                  variant="primary"
                  size="sm"
                  color={COLORS.secondary}
                />
              </View>
            </Card>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.childrenRow}>
                {children.map((child) => {
                  const rewards = getRewards(child.id);
                  return (
                    <TouchableOpacity
                      key={child.id}
                      style={styles.childCard}
                      onPress={() => router.push(`/parent/add-child?id=${child.id}`)}
                      activeOpacity={0.7}
                    >
                      <Card>
                        <View style={styles.childContent}>
                          <Avatar emoji={child.avatar} color={child.color} size={48} avatarConfig={child.avatarConfig} />
                          <Text style={styles.childName}>{child.name}</Text>
                          <Text style={styles.childAge}>{child.age} ans</Text>
                          <StarCounter count={rewards.totalStars} size="sm" />
                        </View>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Routines Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Routines</Text>
            <View style={styles.routineActions}>
              {routines.length >= 2 && (
                <TouchableOpacity
                  onPress={() => {
                    setMergeMode(!mergeMode);
                    setMergeSelection([]);
                  }}
                  style={{ marginRight: 8, opacity: routines.length >= 2 ? 1 : 0.5 }}
                  disabled={routines.length < 2}
                >
                  <MergeIcon size={22} color={mergeMode ? COLORS.error : COLORS.textSecondary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => router.push('/parent/catalog')}
                style={{ marginRight: 8, opacity: children.length === 0 ? 0.5 : 1 }}
                disabled={children.length === 0}
              >
                <CatalogIcon size={22} color={COLORS.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/parent/add-routine')}
                style={{ opacity: children.length === 0 ? 0.5 : 1 }}
                disabled={children.length === 0}
              >
                <AddIcon size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {mergeMode && mergeSelection.length >= 2 && (
            <TouchableOpacity style={styles.mergeBar} onPress={handleMerge}>
              <Text style={styles.mergeBarText}>
                Fusionner {mergeSelection.length} routines →
              </Text>
            </TouchableOpacity>
          )}

          {routines.length === 0 ? (
            <Card>
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>
                  {children.length === 0
                    ? 'Ajoutez un enfant pour créer des routines'
                    : 'Créez votre première routine'}
                </Text>
                {children.length > 0 && (
                  <Button
                    title="Créer une routine"
                    onPress={() => router.push('/parent/add-routine')}
                    variant="primary"
                    size="sm"
                  />
                )}
              </View>
            </Card>
          ) : (
            <View style={styles.routinesList}>
              {children.map((child) => {
                const childRoutines = routinesByChild[child.id] ?? [];
                if (childRoutines.length === 0) return null;
                return (
                  <View key={child.id}>
                    <Text style={styles.routineChild}>
                      {child.avatar} {child.name}
                    </Text>
                    <DraggableList
                      data={childRoutines}
                      keyExtractor={(r) => r.id}
                      onReorder={(newOrder) => {
                        reorderRoutines(child.id, newOrder.map((r) => r.id));
                      }}
                      itemHeight={80}
                      renderItem={(routine) => (
                        <View style={styles.routineRow}>
                          {/* Merge checkbox */}
                          {mergeMode && (
                            <TouchableOpacity
                              style={[
                                styles.mergeCheck,
                                mergeSelection.includes(routine.id) && styles.mergeCheckActive,
                              ]}
                              onPress={() => toggleMergeSelect(routine.id)}
                            >
                              {mergeSelection.includes(routine.id) && (
                                <Text style={styles.mergeCheckMark}>✓</Text>
                              )}
                            </TouchableOpacity>
                          )}

                          {/* Card */}
                          <View style={styles.routineCardCol}>
                            <RoutineCard
                              routine={routine}
                              onPress={() => router.push(`/parent/edit-routine?id=${routine.id}`)}
                              onToggle={() => toggleRoutine(routine.id)}
                              onDuplicate={() => handleDuplicateRoutine(routine)}
                              onDelete={() => handleDeleteRoutine(routine)}
                              showActions
                            />
                          </View>
                        </View>
                      )}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Weather Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌤️ Météo</Text>
          <Card>
            <View style={styles.weatherSettings}>
              <View style={styles.weatherRow}>
                <Text style={styles.weatherLabel}>📍 Géolocalisation automatique</Text>
                <Switch
                  value={useGeolocation}
                  onValueChange={handleToggleGeo}
                  trackColor={{ false: COLORS.surfaceSecondary, true: COLORS.secondaryLight }}
                  thumbColor={useGeolocation ? COLORS.secondary : COLORS.textLight}
                />
              </View>
              {useGeolocation && (
                <Text style={styles.weatherHint}>
                  La météo sera basée sur la position de l'appareil.
                </Text>
              )}
              {!useGeolocation && (
                <>
                  <Text style={styles.weatherSubLabel}>Ou entrez votre ville :</Text>
                  <View style={styles.weatherCityRow}>
                    <TextInput
                      style={styles.weatherInput}
                      value={cityInput}
                      onChangeText={setCityInput}
                      placeholder="Ex : Rennes, Lyon, Marseille..."
                      placeholderTextColor={COLORS.textLight}
                      returnKeyType="done"
                      onSubmitEditing={handleSaveCity}
                    />
                    <TouchableOpacity onPress={handleSaveCity} style={styles.weatherSaveBtn}>
                      <Text style={styles.weatherSaveBtnText}>✓</Text>
                    </TouchableOpacity>
                  </View>
                  {weatherCity ? (
                    <Text style={styles.weatherHint}>Météo actuelle : 📍 {weatherCity}</Text>
                  ) : (
                    <Text style={styles.weatherHint}>Par défaut : Paris</Text>
                  )}
                </>
              )}
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionTiles}>
            <TouchableOpacity
              style={[styles.actionTile, { backgroundColor: '#FFF3E0' }, children.length === 0 && styles.actionTileDisabled]}
              onPress={() => router.push('/parent/rewards')}
              disabled={children.length === 0}
              activeOpacity={0.7}
            >
              <GiftIcon size={28} color="#E65100" style={{ marginBottom: 4 }} />
              <Text style={[styles.actionTileLabel, { color: '#E65100' }]}>Récompenses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionTile, { backgroundColor: '#E8F5E9' }, children.length === 0 && styles.actionTileDisabled]}
              onPress={() => router.push('/parent/stats')}
              disabled={children.length === 0}
              activeOpacity={0.7}
            >
              <StatsIcon size={28} color="#2E7D32" style={{ marginBottom: 4 }} />
              <Text style={[styles.actionTileLabel, { color: '#2E7D32' }]}>Statistiques</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionTile, { backgroundColor: '#E3F2FD' }]}
              onPress={() => router.push('/parent/import')}
              activeOpacity={0.7}
            >
              <ImportIcon size={28} color="#1565C0" style={{ marginBottom: 4 }} />
              <Text style={[styles.actionTileLabel, { color: '#1565C0' }]}>Importer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  homeButton: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  homeButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  routineActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  childrenRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  childCard: {
    width: 130,
  },
  childContent: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  childName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  childAge: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  empty: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  routinesList: {
    gap: SPACING.md,
  },
  routineChild: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
    marginTop: SPACING.sm,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  routineCardCol: {
    flex: 1,
  },
  mergeBar: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mergeBarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: FONT_SIZE.md,
  },
  mergeCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mergeCheckActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  mergeCheckMark: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  actionTiles: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  actionTileDisabled: {
    opacity: 0.4,
  },
  actionTileEmoji: {
    fontSize: 32,
  },
  actionTileLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textAlign: 'center',
  },
  weatherSettings: {
    gap: SPACING.sm,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  weatherSubLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  weatherCityRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  weatherInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  weatherSaveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherSaveBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  weatherHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
