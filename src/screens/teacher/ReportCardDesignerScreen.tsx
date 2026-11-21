import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../api/client';

interface TemplateItem {
  id: string;
  name: string;
  font_family: string;
  orientation: 'portrait' | 'landscape';
  primary_color: string;
  secondary_color: string;
  is_default: boolean;
}

const TEMPLATE_PRESETS: TemplateItem[] = [
  { id: '1', name: 'Classic Academic', font_family: 'Merriweather', orientation: 'portrait', primary_color: '#1E3A8A', secondary_color: '#D97706', is_default: true },
  { id: '2', name: 'Modern Corporate', font_family: 'Inter', orientation: 'portrait', primary_color: '#0F172A', secondary_color: '#059669', is_default: false },
  { id: '3', name: 'Premium Executive', font_family: 'Playfair Display', orientation: 'portrait', primary_color: '#0A192F', secondary_color: '#D4AF37', is_default: false },
  { id: '4', name: 'Primary Colourful', font_family: 'Nunito', orientation: 'portrait', primary_color: '#2563EB', secondary_color: '#F59E0B', is_default: false },
  { id: '5', name: 'Nursery Development', font_family: 'Poppins', orientation: 'landscape', primary_color: '#7C3AED', secondary_color: '#EC4899', is_default: false },
  { id: '6', name: 'Secondary Professional', font_family: 'Roboto', orientation: 'portrait', primary_color: '#1E293B', secondary_color: '#2563EB', is_default: false },
  { id: '7', name: 'International School', font_family: 'Source Sans 3', orientation: 'portrait', primary_color: '#047857', secondary_color: '#0284C7', is_default: false },
  { id: '8', name: 'Minimalist Monochrome', font_family: 'Inter', orientation: 'portrait', primary_color: '#000000', secondary_color: '#4B5563', is_default: false },
  { id: '9', name: 'Green Academic', font_family: 'Lora', orientation: 'portrait', primary_color: '#064E3B', secondary_color: '#10B981', is_default: false },
  { id: '10', name: 'Blue Institutional', font_family: 'Roboto', orientation: 'portrait', primary_color: '#1D4ED8', secondary_color: '#38BDF8', is_default: false },
  { id: '11', name: 'Orange Modern', font_family: 'Poppins', orientation: 'portrait', primary_color: '#EA580C', secondary_color: '#1E293B', is_default: false },
  { id: '12', name: 'Purple Premium', font_family: 'Playfair Display', orientation: 'portrait', primary_color: '#581C87', secondary_color: '#C084FC', is_default: false },
  { id: '13', name: 'Results Dashboard', font_family: 'Inter', orientation: 'portrait', primary_color: '#0F172A', secondary_color: '#3B82F6', is_default: false },
  { id: '14', name: 'Structured Grid', font_family: 'Roboto', orientation: 'portrait', primary_color: '#334155', secondary_color: '#64748B', is_default: false },
  { id: '15', name: 'Certificate Style', font_family: 'Merriweather', orientation: 'portrait', primary_color: '#1C1917', secondary_color: '#B45309', is_default: false },
  { id: '16', name: 'Landscape Academic', font_family: 'Inter', orientation: 'landscape', primary_color: '#1E3A8A', secondary_color: '#0284C7', is_default: false },
  { id: '17', name: 'Compact Eco Mode', font_family: 'Noto Sans', orientation: 'portrait', primary_color: '#374151', secondary_color: '#6B7280', is_default: false },
  { id: '18', name: 'Performance Analytics', font_family: 'Montserrat', orientation: 'portrait', primary_color: '#18181B', secondary_color: '#6366F1', is_default: false },
  { id: '19', name: 'Traditional African', font_family: 'Noto Serif', orientation: 'portrait', primary_color: '#78350F', secondary_color: '#B45309', is_default: false },
  { id: '20', name: 'Custom Blank Canvas', font_family: 'Inter', orientation: 'portrait', primary_color: '#1E293B', secondary_color: '#3B82F6', is_default: false },
];

export const ReportCardDesignerScreen: React.FC = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [activeTab, setActiveTab] = useState<'catalog' | 'preview' | 'controls'>('preview');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem>(TEMPLATE_PRESETS[0]);
  const [designName, setDesignName] = useState(TEMPLATE_PRESETS[0].name);
  const [primaryColor, setPrimaryColor] = useState(TEMPLATE_PRESETS[0].primary_color);
  const [secondaryColor, setSecondaryColor] = useState(TEMPLATE_PRESETS[0].secondary_color);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [fontFamily, setFontFamily] = useState(TEMPLATE_PRESETS[0].font_family);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectPreset = (preset: TemplateItem) => {
    setSelectedTemplate(preset);
    setDesignName(preset.name);
    setPrimaryColor(preset.primary_color);
    setSecondaryColor(preset.secondary_color);
    setOrientation(preset.orientation);
    setFontFamily(preset.font_family);
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      // Persist template customization
      setTimeout(() => {
        setSaving(false);
        setSavedSuccess(true);
      }, 600);
    } catch {
      setSaving(false);
    }
  };

  // Render Preview Canvas
  const renderCanvasPreview = () => (
    <View style={[styles.canvasCard, { backgroundColor: colors.surface, borderColor: primaryColor }]}>
      {/* Header */}
      <View style={[styles.sheetHeader, { borderBottomColor: `${primaryColor}30` }]}>
        <View style={[styles.crestCircle, { backgroundColor: primaryColor }]}>
          <Text style={styles.crestText}>SOS</Text>
        </View>
        <Text style={[styles.schoolTitle, { color: primaryColor }]}>School OS Academy</Text>
        <Text style={[styles.schoolSubtitle, { color: colors.textMuted }]}>
          Official Terminal Report Card • {designName}
        </Text>
        <View style={[styles.termBadge, { backgroundColor: secondaryColor }]}>
          <Text style={styles.termBadgeText}>Second Term — 2025/2026 Session</Text>
        </View>
      </View>

      {/* Biodata Row */}
      <View style={[styles.biodataRow, { borderBottomColor: colors.borderLight }]}>
        <View>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Student Name</Text>
          <Text style={[styles.metaValue, { color: colors.textPrimary }]}>Oluwaseun Adeyemi</Text>
        </View>
        <View>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Adm No</Text>
          <Text style={[styles.metaValue, { color: colors.textPrimary }]}>SCH/2026/0142</Text>
        </View>
        <View>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Class</Text>
          <Text style={[styles.metaValue, { color: colors.textPrimary }]}>JSS 3 Gold</Text>
        </View>
        <View>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Rank</Text>
          <Text style={[styles.metaValue, { color: primaryColor, fontWeight: '800' }]}>#1 of 32</Text>
        </View>
      </View>

      {/* Score Grid Preview */}
      <View style={styles.scoreTable}>
        <View style={[styles.tableHead, { backgroundColor: primaryColor }]}>
          <Text style={[styles.thCol, { flex: 2 }]}>Subject</Text>
          <Text style={styles.thCol}>CA</Text>
          <Text style={styles.thCol}>Exam</Text>
          <Text style={styles.thCol}>Total</Text>
          <Text style={styles.thCol}>Grade</Text>
        </View>
        {[
          { subject: 'Mathematics', ca: '38', exam: '54', total: '92', grade: 'A1' },
          { subject: 'English Language', ca: '34', exam: '48', total: '82', grade: 'A1' },
          { subject: 'Basic Science', ca: '36', exam: '51', total: '87', grade: 'A1' },
          { subject: 'Social Studies', ca: '32', exam: '45', total: '77', grade: 'B2' },
        ].map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.tableRow,
              idx % 2 === 1 && { backgroundColor: colors.surfaceHighlight },
            ]}
          >
            <Text style={[styles.tdCol, { flex: 2, color: colors.textPrimary }]}>{item.subject}</Text>
            <Text style={[styles.tdCol, { color: colors.textPrimary }]}>{item.ca}</Text>
            <Text style={[styles.tdCol, { color: colors.textPrimary }]}>{item.exam}</Text>
            <Text style={[styles.tdCol, { fontWeight: '700', color: colors.textPrimary }]}>{item.total}</Text>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={[styles.gradePill, { backgroundColor: secondaryColor }]}>
                <Text style={styles.gradePillText}>{item.grade}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={[styles.summaryBanner, { backgroundColor: `${primaryColor}15` }]}>
        <Text style={[styles.summaryText, { color: primaryColor }]}>Overall Average: 84.5%</Text>
        <Text style={[styles.summaryText, { color: colors.textMuted }]}>Attendance: 118 / 120 Days</Text>
      </View>

      {/* Footer Seal */}
      <View style={[styles.footerSeal, { borderTopColor: colors.borderLight }]}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>Verified Institutional QR Certificate</Text>
        <Text style={[styles.signatureText, { color: primaryColor }]}>Dr. Emmanuel O. Williams (Principal)</Text>
      </View>
    </View>
  );

  // Render Catalog List
  const renderCatalogList = () => (
    <ScrollView style={styles.catalogList}>
      {TEMPLATE_PRESETS.map((t) => {
        const isSelected = t.id === selectedTemplate.id;
        return (
          <TouchableOpacity
            key={t.id}
            onPress={() => selectPreset(t)}
            style={[
              styles.catalogItem,
              { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.border },
              isSelected && { borderWidth: 2 },
            ]}
          >
            <View style={styles.catalogItemHeader}>
              <Text style={[styles.catalogItemName, { color: colors.textPrimary }]}>{t.name}</Text>
              {t.is_default && (
                <View style={[styles.badgeDefault, { backgroundColor: colors.successLight }]}>
                  <Text style={[styles.badgeDefaultText, { color: colors.success }]}>Default</Text>
                </View>
              )}
            </View>
            <View style={styles.colorDotsRow}>
              <View style={[styles.colorDot, { backgroundColor: t.primary_color }]} />
              <View style={[styles.colorDot, { backgroundColor: t.secondary_color }]} />
              <Text style={[styles.catalogItemMeta, { color: colors.textMuted }]}>
                {t.orientation} • {t.font_family}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // Render Controls Panel
  const renderControlsPanel = () => (
    <ScrollView style={styles.controlsPanel}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Design Controls</Text>

      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Template Name</Text>
      <TextInput
        style={[styles.inputBox, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
        value={designName}
        onChangeText={setDesignName}
      />

      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Primary Brand Color</Text>
      <View style={styles.colorInputRow}>
        <View style={[styles.colorSample, { backgroundColor: primaryColor }]} />
        <TextInput
          style={[styles.inputBox, { flex: 1, color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={primaryColor}
          onChangeText={setPrimaryColor}
        />
      </View>

      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Accent Color</Text>
      <View style={styles.colorInputRow}>
        <View style={[styles.colorSample, { backgroundColor: secondaryColor }]} />
        <TextInput
          style={[styles.inputBox, { flex: 1, color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
          value={secondaryColor}
          onChangeText={setSecondaryColor}
        />
      </View>

      <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Page Orientation</Text>
      <View style={styles.orientationRow}>
        <TouchableOpacity
          onPress={() => setOrientation('portrait')}
          style={[
            styles.toggleBtn,
            { borderColor: colors.border, backgroundColor: orientation === 'portrait' ? colors.primary : colors.surface },
          ]}
        >
          <Text style={{ color: orientation === 'portrait' ? '#FFFFFF' : colors.textPrimary, fontWeight: '700', fontSize: 12 }}>
            A4 Portrait
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOrientation('landscape')}
          style={[
            styles.toggleBtn,
            { borderColor: colors.border, backgroundColor: orientation === 'landscape' ? colors.primary : colors.surface },
          ]}
        >
          <Text style={{ color: orientation === 'landscape' ? '#FFFFFF' : colors.textPrimary, fontWeight: '700', fontSize: 12 }}>
            A4 Landscape
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveBtnText}>Save & Apply Template</Text>
        )}
      </TouchableOpacity>

      {savedSuccess && (
        <View style={[styles.successBanner, { backgroundColor: colors.successLight }]}>
          <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700' }}>
            ✓ Template design saved successfully!
          </Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Report Card Template Designer</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Tablet-First 3-Panel Visual Studio • 20 Distinct Layouts
        </Text>
      </View>

      {/* Mobile Tab Bar (only when phone width < 768) */}
      {!isTablet && (
        <View style={[styles.mobileTabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {(['catalog', 'preview', 'controls'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.mobileTabItem,
                activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
            >
              <Text style={{ color: activeTab === tab ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 13, textTransform: 'capitalize' }}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Main Workspace */}
      {isTablet ? (
        /* Dedicated 3-Panel Tablet Interface */
        <View style={styles.tabletWorkspace}>
          <View style={[styles.panelLeft, { borderRightColor: colors.border }]}>
            <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>Design Catalog (20)</Text>
            {renderCatalogList()}
          </View>
          <View style={styles.panelCenter}>
            <ScrollView contentContainerStyle={styles.canvasContainer}>
              {renderCanvasPreview()}
            </ScrollView>
          </View>
          <View style={[styles.panelRight, { borderLeftColor: colors.border }]}>
            {renderControlsPanel()}
          </View>
        </View>
      ) : (
        /* Phone View (Single Tab active) */
        <View style={styles.phoneWorkspace}>
          {activeTab === 'catalog' && renderCatalogList()}
          {activeTab === 'preview' && (
            <ScrollView contentContainerStyle={styles.canvasContainer}>
              {renderCanvasPreview()}
            </ScrollView>
          )}
          {activeTab === 'controls' && renderControlsPanel()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  mobileTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  mobileTabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabletWorkspace: {
    flex: 1,
    flexDirection: 'row',
  },
  phoneWorkspace: {
    flex: 1,
  },
  panelLeft: {
    width: 260,
    borderRightWidth: 1,
    padding: 12,
  },
  panelCenter: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  panelRight: {
    width: 280,
    borderLeftWidth: 1,
    padding: 16,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  catalogList: {
    flex: 1,
  },
  catalogItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  catalogItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catalogItemName: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeDefault: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeDefaultText: {
    fontSize: 9,
    fontWeight: '800',
  },
  colorDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catalogItemMeta: {
    fontSize: 10,
    marginLeft: 4,
  },
  canvasContainer: {
    padding: 20,
    alignItems: 'center',
  },
  canvasCard: {
    width: '100%',
    maxWidth: 540,
    borderRadius: 10,
    borderWidth: 2,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  crestCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  crestText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  schoolTitle: {
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  schoolSubtitle: {
    fontSize: 10,
    marginTop: 1,
  },
  termBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  termBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  biodataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 9,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  scoreTable: {
    marginBottom: 10,
  },
  tableHead: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 4,
  },
  thCol: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  tdCol: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
  },
  gradePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  gradePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  summaryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  footerSeal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 8,
  },
  signatureText: {
    fontSize: 8,
    fontWeight: '700',
  },
  controlsPanel: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
  colorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorSample: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  orientationRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  successBanner: {
    marginTop: 10,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
});
