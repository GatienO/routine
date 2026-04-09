import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import {
  ROUTINE_PACKS,
  RoutineTemplate,
} from '../../src/constants/routineTemplates';
import { Child } from '../../src/types';
import { CATEGORY_CONFIG, COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../src/constants/theme';
import { generateId } from '../../src/utils/id';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { backOrReplace } from '../../src/utils/navigation';

export default function CatalogScreen() {
  const router = useRouter();
  const { children } = useChildrenStore();
  const { addRoutine } = useRoutineStore();
  const [expandedPack, setExpandedPack] = useState<string | null>(ROUTINE_PACKS[0]?.id ?? null);
  const [selectedTemplate, setSelectedTemplate] = useState<RoutineTemplate | null>(null);
  const [pendingImportTemplate, setPendingImportTemplate] = useState<RoutineTemplate | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const importForChildren = (template: RoutineTemplate, childIds: string[]) => {
    childIds.forEach((childId) => {
      const steps = template.steps.map((step, index) => ({
        id: generateId(),
        title: step.title,
        icon: step.icon,
        color: template.color,
        durationMinutes: step.durationMinutes,
        instruction: step.instruction,
        isRequired: step.isRequired,
        order: index,
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
    });

    setPendingImportTemplate(null);
    setSelectedTemplate(null);
    setFeedbackMessage(
      `"${template.name}" a ete ajoutee pour ${childIds.length} enfant${childIds.length > 1 ? 's' : ''}.`,
    );
  };

  const handleImport = (template: RoutineTemplate) => {
    if (children.length === 0) {
      setFeedbackMessage('Ajoutez d abord un enfant pour importer une routine.');
      return;
    }

    if (children.length === 1) {
      importForChildren(template, [children[0].id]);
      return;
    }

    setPendingImportTemplate(template);
  };

  const totalDuration = (template: RoutineTemplate) =>
    template.steps.reduce((sum, step) => sum + step.durationMinutes, 0);

  const categoryLabel = (category: string) =>
    CATEGORY_CONFIG[category]?.label ?? category;

  const categoryIcon = (category: string) =>
    CATEGORY_CONFIG[category]?.icon ?? '✨';

  if (selectedTemplate) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => setSelectedTemplate(null)}>
            <Text style={styles.back}>← Retour au catalogue</Text>
          </TouchableOpacity>

          <BackButton style={styles.backButton} onPress={() => setSelectedTemplate(null)} />
          {feedbackMessage ? (
            <TouchableOpacity onPress={() => setFeedbackMessage(null)} activeOpacity={0.85}>
              <View style={styles.feedbackBanner}>
                <Text style={styles.feedbackText}>{feedbackMessage}</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          <View style={styles.detailHeader}>
            <View style={styles.detailIconWrap}>
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
            Etapes ({selectedTemplate.steps.length})
          </Text>

          {selectedTemplate.steps.map((step, index) => (
            <Card key={index} style={styles.stepCard}>
              <View style={styles.stepRow}>
                <Text style={styles.stepOrder}>{index + 1}</Text>
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
              title="Importer cette routine"
              onPress={() => handleImport(selectedTemplate)}
              variant="primary"
              size="lg"
              color={selectedTemplate.color}
            />
          </View>
        </ScrollView>

        <ChildPickerModal
          children={children}
          template={pendingImportTemplate}
          onClose={() => setPendingImportTemplate(null)}
          onImport={(childIds) => pendingImportTemplate && importForChildren(pendingImportTemplate, childIds)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => backOrReplace(router, '/parent')}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>

        <BackButton style={styles.backButton} onPress={() => backOrReplace(router, '/parent')} />
        {feedbackMessage ? (
          <TouchableOpacity onPress={() => setFeedbackMessage(null)} activeOpacity={0.85}>
            <View style={styles.feedbackBanner}>
              <Text style={styles.feedbackText}>{feedbackMessage}</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.title}>Catalogue de routines</Text>
        <Text style={styles.subtitle}>
          Choisissez un modele et importez-le en un tap
        </Text>

        {ROUTINE_PACKS.map((pack) => (
          <View key={pack.id} style={styles.packSection}>
            <TouchableOpacity
              style={[
                styles.packHeader,
                expandedPack === pack.id && styles.packHeaderActive,
              ]}
              onPress={() => setExpandedPack(expandedPack === pack.id ? null : pack.id)}
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
              pack.templates.map((template) => (
                <View key={template.id}>
                  <Card style={[styles.templateCard, { borderLeftColor: template.color, borderLeftWidth: 4 }]}>
                    <View style={styles.templateRow}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setSelectedTemplate(template)}
                        style={styles.templateMainTap}
                      >
                        <View style={styles.templateMainContent}>
                          <OpenMoji emoji={template.icon} size={32} />
                          <View style={styles.templateInfo}>
                            <Text style={styles.templateName}>{template.name}</Text>
                            <Text style={styles.templateDescription} numberOfLines={2}>
                              {template.description}
                            </Text>
                            <Text style={styles.templateMeta}>
                              {template.steps.length} etapes · ~{totalDuration(template)} min · {template.ageRange[0]}-{template.ageRange[1]} ans
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.importBtn, { backgroundColor: template.color + '20' }]}
                        onPress={() => handleImport(template)}
                      >
                        <Text style={[styles.importBtnText, { color: template.color }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                </View>
              ))}
          </View>
        ))}
      </ScrollView>

      <ChildPickerModal
        children={children}
        template={pendingImportTemplate}
        onClose={() => setPendingImportTemplate(null)}
        onImport={(childIds) => pendingImportTemplate && importForChildren(pendingImportTemplate, childIds)}
      />
    </SafeAreaView>
  );
}

function ChildPickerModal({
  children,
  template,
  onClose,
  onImport,
}: {
  children: Child[];
  template: RoutineTemplate | null;
  onClose: () => void;
  onImport: (childIds: string[]) => void;
}) {
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);

  React.useEffect(() => {
    if (!template) {
      setSelectedChildIds([]);
      return;
    }

    setSelectedChildIds(children.map((child) => child.id));
  }, [template, children]);

  const toggleChild = (childId: string) => {
    setSelectedChildIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId],
    );
  };

  return (
    <Modal
      visible={template !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Pour quel enfant ?</Text>
          <Text style={styles.modalSubtitle}>
            Choisissez un ou plusieurs enfants qui recevront "{template?.name}".
          </Text>
          <View style={styles.modalChoices}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childChoice,
                  selectedChildIds.includes(child.id) && styles.childChoiceSelected,
                ]}
                onPress={() => toggleChild(child.id)}
              >
                <OpenMoji emoji={child.avatar} size={22} />
                <Text style={styles.childChoiceText}>{child.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[
              styles.modalImportBtn,
              selectedChildIds.length === 0 && styles.modalImportBtnDisabled,
            ]}
            onPress={() => selectedChildIds.length > 0 && onImport(selectedChildIds)}
            disabled={selectedChildIds.length === 0}
          >
            <Text style={styles.modalImportBtnText}>
              Importer pour {selectedChildIds.length} enfant{selectedChildIds.length > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  back: {
    fontSize: 0,
    color: 'transparent',
    marginBottom: 0,
    height: 0,
  },
  backButton: {
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
  feedbackBanner: {
    backgroundColor: COLORS.success + '18',
    borderWidth: 1,
    borderColor: COLORS.success + '35',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  feedbackText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
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
  templateCard: {
    marginTop: 1,
    borderRadius: 0,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  templateMainTap: {
    flex: 1,
  },
  templateMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
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
  detailHeader: { alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  detailIconWrap: { alignItems: 'center', marginBottom: SPACING.md },
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
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  stepMeta: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  stepInstruction: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 2 },
  importArea: { marginTop: SPACING.xl },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalChoices: {
    gap: SPACING.sm,
  },
  childChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  childChoiceSelected: {
    backgroundColor: COLORS.secondary + '18',
    borderColor: COLORS.secondary,
  },
  childChoiceText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalImportBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  modalImportBtnDisabled: {
    backgroundColor: COLORS.textLight,
  },
  modalImportBtnText: {
    color: '#FFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  modalCancel: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  modalCancelText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
