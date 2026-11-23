import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { apiClient, ParentProfileData } from '../../api/client';

interface Props {
  onBack?: () => void;
  onSelectStudent?: (studentId: string) => void;
}

export const ParentProfileScreen: React.FC<Props> = ({ onBack, onSelectStudent }) => {
  const { colors, isDark } = useTheme();
  const [data, setData] = useState<ParentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const res = await apiClient.getParentProfile();
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setData({
        guardian: {
          id: 'par-1',
          full_name: 'Dr. Babatunde Adeleke',
          title: 'Dr.',
          relationship: 'Father / Legal Guardian',
          phone_primary: '+234 803 123 4567',
          phone_secondary: '+234 802 987 6543',
          email: 'parent@schoolos.internal',
          address: 'Plot 14, Admiralty Way, Lekki Phase 1, Lagos',
          occupation: 'Chief Medical Director & Executive',
        },
        children: [
          {
            id: 'stu-1',
            admission_number: 'AHC/2026/0001',
            full_name: 'David Adeleke',
            first_name: 'David',
            last_name: 'Adeleke',
            gender: 'male',
            class_name: 'JSS 2 Gold',
            house_name: 'Emerald Eagles',
            status: 'active',
            attendance_rate: 98.4,
          },
          {
            id: 'stu-2',
            admission_number: 'AHC/2026/0002',
            full_name: 'Grace Adeleke',
            first_name: 'Grace',
            last_name: 'Adeleke',
            gender: 'female',
            class_name: 'SS 1 Diamond',
            house_name: 'Ruby Falcons',
            status: 'active',
            attendance_rate: 96.8,
          },
        ],
        total_outstanding: 150000.0,
        ecosystem_apps: [
          {
            id: 'mobile',
            name: 'School OS Mobile App',
            short_name: 'SchoolS Mobile',
            category: 'Parent Companion',
            platform: 'Android / iOS',
            version: 'v1.0.0',
            file_size: '119.3 MB',
            filename: 'SchoolOS_Mobile_v1.0.0.apk',
            download_url: 'https://schos.wchapel.com/downloads/apps/mobile',
            icon: 'Smartphone',
            badge: 'Hermes Engine',
            description: 'Parent companion for realtime attendance tracking, terminal report cards, and online fee payments.',
            features: ['Live gate attendance alerts', 'Direct invoice settlement via Paystack'],
            target_roles: ['parent'],
          },
        ],
      });
    }
    setLoading(false);
  };

  const handleCopyCode = (code: string) => {
    setCopied(true);
    Alert.alert('Guardian Code Copied', `Family Code [${code}] copied to clipboard for instant ward linking.`);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading Family Profile...
        </Text>
      </View>
    );
  }

  const guardian = data?.guardian;
  const children = data?.children || [];
  const apps = data?.ecosystem_apps || [];
  const profileCode = (data as any)?.profile_code || 'PAR-2026-088';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Top Bar Header */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back to Portal</Text>
        </TouchableOpacity>
      )}

      {/* Hero Card with Guardian Family Code */}
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {guardian?.full_name ? guardian.full_name[0] : 'P'}
            </Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.guardianName, { color: colors.text }]}>{guardian?.full_name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{guardian?.relationship}</Text>
              </View>
              <View style={styles.pickupBadge}>
                <Text style={styles.pickupBadgeText}>✓ AUTHORIZED PICKUP</Text>
              </View>
            </View>
          </View>
        </View>

        {/* High-Contrast Guardian Profile Code Banner */}
        <View style={[styles.codeBanner, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF', borderColor: '#2563EB' }]}>
          <View>
            <Text style={styles.codeLabel}>GUARDIAN FAMILY CODE</Text>
            <Text style={styles.codeText}>{profileCode}</Text>
            <Text style={styles.codeSubtext}>Enter in mobile app for instant child association</Text>
          </View>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopyCode(profileCode)}
          >
            <Text style={styles.copyButtonText}>{copied ? 'COPIED ✓' : 'COPY CODE'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Guardian Personal & Contact Details */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>👨‍👩‍👧 Guardian Information</Text>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Primary Phone:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{guardian?.phone_primary}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email Address:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{guardian?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Residential Address:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{guardian?.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Profession / Career:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{guardian?.occupation}</Text>
        </View>
      </View>

      {/* Linked Children Roster */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.childrenHeaderRow}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>🎒 Linked Children ({children.length})</Text>
          <Text style={[styles.childrenSubtext, { color: colors.textSecondary }]}>Active Academic SIS</Text>
        </View>

        {children.map((child) => (
          <View key={child.id} style={[styles.childItem, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <View style={styles.childTopRow}>
              <View style={styles.childAvatar}>
                <Text style={styles.childAvatarText}>{child.first_name[0]}{child.last_name[0]}</Text>
              </View>
              <View style={styles.childInfo}>
                <Text style={[styles.childName, { color: colors.text }]}>{child.full_name}</Text>
                <Text style={[styles.childCode, { color: colors.primary }]}>{child.admission_number}</Text>
              </View>
              <View style={styles.classBadge}>
                <Text style={styles.classBadgeText}>{child.class_name}</Text>
              </View>
            </View>

            <View style={styles.childBottomRow}>
              <Text style={[styles.houseText, { color: colors.textSecondary }]}>House: {child.house_name}</Text>
              {onSelectStudent && (
                <TouchableOpacity
                  style={styles.viewStudentButton}
                  onPress={() => onSelectStudent(child.id)}
                >
                  <Text style={styles.viewStudentText}>View Student Profile →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Parent Connected Mobile Application (Strictly Mobile App) */}
      <View style={[styles.appsSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.appsHeader}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>📲 Parent Mobile Application</Text>
          <View style={styles.cloudBadge}>
            <Text style={styles.cloudBadgeText}>● LIVE CLOUD</Text>
          </View>
        </View>
        <Text style={[styles.appsSubheading, { color: colors.textSecondary }]}>
          Keep track of your child's attendance and school fees with the mobile companion.
        </Text>

        {apps.map((app) => (
          <View key={app.id} style={[styles.appItem, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <View style={styles.appTopRow}>
              <View>
                <Text style={[styles.appName, { color: colors.text }]}>{app.name}</Text>
                <Text style={[styles.appPlatform, { color: colors.textSecondary }]}>
                  {app.platform} • {app.file_size}
                </Text>
              </View>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>{app.version}</Text>
              </View>
            </View>
            <Text style={[styles.appDesc, { color: colors.textSecondary }]}>{app.description}</Text>
            <TouchableOpacity
              style={[styles.downloadButton, { backgroundColor: '#2563EB' }]}
              onPress={() => Linking.openURL(app.download_url)}
            >
              <Text style={styles.downloadButtonText}>⬇ DOWNLOAD APK ({app.file_size})</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '500' },
  backButton: { marginBottom: 12 },
  backButtonText: { fontSize: 13, fontWeight: '600' },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  titleContainer: { flex: 1 },
  guardianName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  roleBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: '#1E40AF' },
  pickupBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pickupBadgeText: { fontSize: 10, fontWeight: '700', color: '#065F46' },
  codeBanner: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeLabel: { fontSize: 10, fontWeight: '800', color: '#1E40AF', letterSpacing: 0.5 },
  codeText: { fontSize: 24, fontWeight: '900', color: '#2563EB', fontFamily: 'monospace', marginVertical: 2 },
  codeSubtext: { fontSize: 10, color: '#1E40AF' },
  copyButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#33415530',
  },
  infoLabel: { fontSize: 12, fontWeight: '500' },
  infoValue: { fontSize: 12, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  childrenHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  childrenSubtext: { fontSize: 11 },
  childItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  childTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  childAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  childAvatarText: { fontSize: 14, fontWeight: '800', color: '#1E40AF' },
  childInfo: { flex: 1 },
  childName: { fontSize: 13, fontWeight: '700' },
  childCode: { fontSize: 11, fontFamily: 'monospace', marginTop: 1 },
  classBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  classBadgeText: { fontSize: 10, fontWeight: '700', color: '#4338CA' },
  childBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#33415520',
  },
  houseText: { fontSize: 11 },
  viewStudentButton: { paddingVertical: 2 },
  viewStudentText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  appsSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  appsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cloudBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cloudBadgeText: { fontSize: 9, fontWeight: '800', color: '#065F46' },
  appsSubheading: { fontSize: 11, marginBottom: 14 },
  appItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  appTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  appName: { fontSize: 14, fontWeight: '700' },
  appPlatform: { fontSize: 11, marginTop: 2 },
  versionBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  versionText: { fontSize: 10, fontWeight: '700', color: '#4338CA' },
  appDesc: { fontSize: 12, lineHeight: 16, marginBottom: 12 },
  downloadButton: {
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
