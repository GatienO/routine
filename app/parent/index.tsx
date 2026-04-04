import React, { useState } from 'react';
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
import { StarCounter } from '../../src/components/rewards/Counters';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

export default function ParentDashboard() {
  const router = useRouter();
  const { children } = useChildrenStore();
  const { routines, toggleRoutine } = useRoutineStore();
  const { getRewards } = useRewardStore();
  const { setParentMode, selectChild, weatherCity, useGeolocation, setWeatherCity, setUseGeolocation } = useAppStore();
  const { refresh: refreshWeather } = useWeatherStore();
  const [cityInput, setCityInput] = useState(weatherCity);

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
            <Text style={styles.homeButtonText}>🏠 Accueil</Text>
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
                          <Avatar emoji={child.avatar} color={child.color} size={48} />
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
              <Button
                title="📚 Catalogue"
                onPress={() => router.push('/parent/catalog')}
                variant="ghost"
                size="sm"
                color={COLORS.secondary}
                disabled={children.length === 0}
              />
              <Button
                title="+ Créer"
                onPress={() => router.push('/parent/add-routine')}
                variant="ghost"
                size="sm"
                color={COLORS.primary}
                disabled={children.length === 0}
              />
            </View>
          </View>

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
              {routines.map((routine) => {
                const child = children.find((c) => c.id === routine.childId);
                return (
                  <View key={routine.id}>
                    {child && (
                      <Text style={styles.routineChild}>
                        {child.avatar} {child.name}
                      </Text>
                    )}
                    <RoutineCard
                      routine={routine}
                      onPress={() => router.push(`/parent/edit-routine?id=${routine.id}`)}
                      onToggle={() => toggleRoutine(routine.id)}
                      showToggle
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
              <Text style={styles.actionTileEmoji}>🎁</Text>
              <Text style={[styles.actionTileLabel, { color: '#E65100' }]}>Récompenses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionTile, { backgroundColor: '#E8F5E9' }, children.length === 0 && styles.actionTileDisabled]}
              onPress={() => router.push('/parent/stats')}
              disabled={children.length === 0}
              activeOpacity={0.7}
            >
              <Text style={styles.actionTileEmoji}>📊</Text>
              <Text style={[styles.actionTileLabel, { color: '#2E7D32' }]}>Statistiques</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionTile, { backgroundColor: '#E3F2FD' }]}
              onPress={() => router.push('/parent/import')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionTileEmoji}>📥</Text>
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
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
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
