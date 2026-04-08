import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import {
  ROUTINE_PACKS,
  RoutineTemplate,
  RoutinePack,
} from '../../src/constants/routineTemplates';
import { CATEGORY_CONFIG, COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../src/constants/theme';
import { generateId } from '../../src/utils/id';
import { OpenMoji } from '../../src/components/ui/OpenMoji';

export default function CatalogScreen() {
  const router = useRouter();
  const { children } = useChildrenStore();
  const { addRoutine } = useRoutineStore();
  const [expandedPack, setExpandedPack] = useState<string | null>(ROUTINE_PACKS[0]?.id ?? null);
  const [selectedTemplate, setSelectedTemplate] = useState<RoutineTemplate | null>(null);

  const handleImport = (template: RoutineTemplate) => {
    if (children.length === 0) {
      Alert.alert('Aucun enfant', 'Ajoutez d\'abord un enfant pour importer une routine.');
      return;
    }

    const importForChild = (childId: string) => {
      const steps = template.steps.map((s, i) => ({
        id: generateId(),
        title: s.title,
        icon: s.icon,
        color: template.color,
        durationMinutes: s.durationMinutes,
        instruction: s.instruction,
        isRequired: s.isRequired,
        order: i,
      }));

      addRoutine({
        childId,
        name: template.name,
        description: template.description,
        icon: template.icon,
        color: template.color,
        category: template.category,
        steps,
        isActive: true,
      });

      Alert.alert('✅ Routine ajoutée !', `"${template.name}" a été ajoutée.`);
      setSelectedTemplate(null);
    };

    if (children.length === 1) {
      importForChild(children[0].id);
    } else {
      Alert.alert(
        'Pour quel enfant ?',
        undefined,
        [
          ...children.map((c) => ({
            text: `${c.avatar} ${c.name}`,
            onPress: () => importForChild(c.id),
          })),
          { text: 'Annuler', style: 'cancel' as const },
        ]
      );
    }
  };

  const totalDuration = (t: RoutineTemplate) =>
    t.steps.reduce((sum, s) => sum + s.durationMinutes, 0);

  const categoryLabel = (cat: string) =>
    CATEGORY_CONFIG[cat]?.label ?? cat;

  const categoryIcon = (cat: string) =>
    CATEGORY_CONFIG[cat]?.icon ?? '✨';

  // Detail view
  if (selectedTemplate) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => setSelectedTemplate(null)}>
            <Text style={styles.back}>← Retour au catalogue</Text>
          </TouchableOpacity>

          <View style={styles.detailHeader}>
            <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
              <OpenMoji emoji={selectedTemplate.icon} size={48} />
            </View>
            <Text style={styles.detailName}>{selectedTemplate.name}</Text>
            <Text style={styles.detailDescription}>{selectedTemplate.description}</Text>
            <View style={styles.detailMeta}>
              <View style={[styles.badge, { backgroundColor: selectedTemplate.color + '25' }]}>
                <Text style={[styles.badgeText, { color: selectedTemplate.color }]}>
                  {categoryIcon(selectedTemplate.category)} {categoryLabel(selectedTemplate.category)}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: COLORS.surfaceSecondary }]}>
                <Text style={styles.badgeText}>
                  {selectedTemplate.ageRange[0]}-{selectedTemplate.ageRange[1]} ans
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: COLORS.surfaceSecondary }]}>
                <Text style={styles.badgeText}>
                  ~{totalDuration(selectedTemplate)} min
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionLabel}>
            Étapes ({selectedTemplate.steps.length})
          </Text>

          {selectedTemplate.steps.map((step, i) => (
            <Card key={i} style={styles.stepCard}>
              <View style={styles.stepRow}>
                <Text style={styles.stepOrder}>{i + 1}</Text>
                <OpenMoji emoji={step.icon} size={28} />
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepMeta}>
                    {step.durationMinutes} min · {step.isRequired ? 'Obligatoire' : 'Facultatif'}
                  </Text>
                  {step.instruction ? (
                    <Text style={styles.stepInstruction}>{step.instruction}</Text>
                  ) : null}
                </View>
              </View>
            </Card>
          ))}

          <View style={styles.importArea}>
            <Button
              title="📥 Importer cette routine"
              onPress={() => handleImport(selectedTemplate)}
              variant="primary"
              size="lg"
              color={selectedTemplate.color}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Pack list view
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📚 Catalogue de routines</Text>
        <Text style={styles.subtitle}>
          Choisissez un modèle et importez-le en un tap
        </Text>

        {ROUTINE_PACKS.map((pack) => (
          <View key={pack.id} style={styles.packSection}>
            <TouchableOpacity
              style={[
                styles.packHeader,
                expandedPack === pack.id && styles.packHeaderActive,
              ]}
              onPress={() =>
                setExpandedPack(expandedPack === pack.id ? null : pack.id)
              }
              activeOpacity={0.7}
            >
              <OpenMoji emoji={pack.icon} size={32} />
              <View style={styles.packInfo}>
                <Text style={styles.packName}>{pack.name}</Text>
                <Text style={styles.packDesc}>{pack.description}</Text>
              </View>
              <Text style={styles.packCount}>{pack.templates.length}</Text>
              <Text style={styles.packChevron}>
                {expandedPack === pack.id ? '▾' : '▸'}
              </Text>
            </TouchableOpacity>

            {expandedPack === pack.id &&
              pack.templates.map((tpl) => (
                <TouchableOpacity
                  key={tpl.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedTemplate(tpl)}
                >
                  <Card style={[styles.templateCard, { borderLeftColor: tpl.color, borderLeftWidth: 4 }]}>
                    <View style={styles.templateRow}>
                      <OpenMoji emoji={tpl.icon} size={32} />
                      <View style={styles.templateInfo}>
                        <Text style={styles.templateName}>{tpl.name}</Text>
                        <Text style={styles.templateDescription} numberOfLines={2}>{tpl.description}</Text>
                        <Text style={styles.templateMeta}>
                          {tpl.steps.length} étapes · ~{totalDuration(tpl)} min · {tpl.ageRange[0]}-{tpl.ageRange[1]} ans
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.importBtn, { backgroundColor: tpl.color + '20' }]}
                        onPress={() => handleImport(tpl)}
                      >
                        <Text style={[styles.importBtnText, { color: tpl.color }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  back: {
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl + 2,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },

  // Packs
  packSection: { marginBottom: SPACING.lg },
  packHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    ...SHADOWS.sm,
  },
  packHeaderActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  packIcon: { fontSize: 32 },
  packInfo: { flex: 1 },
  packName: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.text },
  packDesc: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  packCount: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textLight,
    backgroundColor: COLORS.surfaceSecondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
  },
  packChevron: { fontSize: 16, color: COLORS.textLight },

  // Template cards
  templateCard: {
    marginTop: 1,
    borderRadius: 0,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  templateIcon: { fontSize: 32 },
  templateInfo: { flex: 1 },
  templateName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  templateDescription: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  templateMeta: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 4 },
  importBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importBtnText: { fontSize: 22, fontWeight: '800' },

  // Detail view
  detailHeader: { alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  detailIcon: { fontSize: 70 },
  detailName: { fontSize: FONT_SIZE.xxl, fontWeight: '900', color: COLORS.text },
  detailDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 420,
  },
  detailMeta: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  badgeText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.textSecondary },
  sectionLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  stepCard: { marginBottom: SPACING.xs },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  stepOrder: { fontSize: FONT_SIZE.sm, fontWeight: '800', color: COLORS.textLight, width: 20 },
  stepIcon: { fontSize: 28 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  stepMeta: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  stepInstruction: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 2 },
  importArea: { marginTop: SPACING.xl },
});
