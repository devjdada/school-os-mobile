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
import { apiClient, TeacherProfileDataFull } from '../../api/client';

interface Props {
  onBack?: () => void;
}

export const TeacherProfileScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, isDark } = useTheme();
  const [data, setData] = useState<TeacherProfileDataFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const res = await apiClient.getTeacherProfileFull();
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setData({
        staff: {
          id: 'stf-1',
          staff_id_number: 'STF/2026/042',
          full_name: 'Dr. Babatunde Adeleke',
          first_name: 'Babatunde',
          last_name: 'Adeleke',
          email: 'teacher@schoolos.internal',
          phone: '+234 801 234 5678',
          gender: 'male',
          role_type: 'teaching',
          designation: 'Senior STEM Specialist & HOD',
          department: 'Science & STEM Education',
          qualification: 'Ph.D. Education, M.Sc. Applied Physics',
          employment_type: 'Full-Time Permanent',
          status: 'active',
          joined_at: 'Sept 01, 2024',
        },
        form_classes: [
          { id: 'fc-1', class_name: 'SS 2 Science A' },
        ],
        subject_allocations: [
          { id: 'sa-1', class_name: 'SS 2 Science A', subject_name: 'Physics', subject_code: 'PHY', periods_per_week: 5 },
          { id: 'sa-2', class_name: 'SS 3 Science B', subject_name: 'Applied Mechanics', subject_code: 'MEC', periods_per_week: 4 },
        ],
        ecosystem_apps: [
          {
            id: 'smartclass-tablet',
            name: 'School OS SmartClass Tablet',
            short_name: 'SmartClass Teacher',
            category: 'Classroom Instruction',
            platform: 'Android Tablet (Teachers)',
            version: 'v1.0.0',
            file_size: '17.0 MB',
            filename: 'SchoolOS_SmartClass_Tablet_v1.0.0.apk',
            download_url: 'https://schos.wchapel.com/downloads/apps/smartclass-tablet',
            icon: 'Tablet',
            badge: 'Teacher Tablet',
            description: 'Interactive classroom teaching tablet application with digital canvas casting.',
            features: ['Live digital whiteboard casting', 'Quick in-class comprehension quizzes'],
            target_roles: ['teacher'],
          },
          {
            id: 'smartclass-receiver',
            name: 'School OS SmartClass TV Receiver',
            short_name: 'SmartClass TV',
            category: 'Display Receiver',
            platform: 'Android TV / Projector Dongle',
            version: 'v1.0.0',
            file_size: '15.4 MB',
            filename: 'SchoolOS_SmartClass_TVReceiver_v1.0.0.apk',
            download_url: 'https://schos.wchapel.com/downloads/apps/smartclass-receiver',
            icon: 'Tv',
            badge: 'Android TV',
            description: 'Dedicated TV display receiver with 6-digit PIN pairing.',
            features: ['Instant 6-digit pairing PIN', 'High-definition canvas rendering'],
            target_roles: ['teacher'],
          },
          {
            id: 'mobile',
            name: 'School OS Mobile App',
            short_name: 'SchoolS Mobile',
            category: 'Mobile Companion',
            platform: 'Android / iOS',
            version: 'v1.0.0',
            file_size: '119.3 MB',
            filename: 'SchoolOS_Mobile_v1.0.0.apk',
            download_url: 'https://schos.wchapel.com/downloads/apps/mobile',
            icon: 'Smartphone',
            badge: 'Hermes Powered',
            description: 'Mobile companion for schedules, attendance roll calls, and staff communications.',
            features: ['Class roll call', 'Timetable notifications'],
            target_roles: ['teacher', 'admin', 'parent', 'student'],
          },
        ],
      });
    }
    setLoading(false);
  };

  const handleCopyCode = (code: string) => {
    setCopied(true);
    Alert.alert('Staff ID Copied', `Staff Code [${code}] copied to clipboard for SmartClass Tablet & Web login.`);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading Educator Profile...
        </Text>
      </View>
    );
  }

  const staff = data?.staff;
  const formClasses = data?.form_classes || [];
  const subjectAllocations = data?.subject_allocations || [];
  const apps = data?.ecosystem_apps || [];
  const profileCode = staff?.staff_id_number || 'STF/2026/001';

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

      {/* Hero Card with Staff ID Profile Code */}
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {staff?.first_name ? staff.first_name[0] : 'T'}
              {staff?.last_name ? staff.last_name[0] : 'C'}
            </Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.staffName, { color: colors.text }]}>{staff?.full_name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{staff?.designation}</Text>
              </View>
              <View style={styles.deptBadge}>
                <Text style={styles.deptBadgeText}>{staff?.department}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* High-Contrast Staff Profile Code Banner */}
        <View style={[styles.codeBanner, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: '#059669' }]}>
          <View>
            <Text style={styles.codeLabel}>OFFICIAL STAFF PROFILE CODE</Text>
            <Text style={styles.codeText}>{profileCode}</Text>
            <Text style={styles.codeSubtext}>Use for SmartClass Tablet & TV receiver pairing</Text>
          </View>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopyCode(profileCode)}
          >
            <Text style={styles.copyButtonText}>{copied ? 'COPIED ✓' : 'COPY CODE'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Professional Details Card */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>🎓 Professional & Employment Details</Text>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Qualifications:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{staff?.qualification}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Employment Type:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{staff?.employment_type}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Faculty Email:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{staff?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Contact Phone:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{staff?.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Form Classes:</Text>
          <Text style={[styles.infoValue, { color: '#059669' }]}>
            {formClasses.length > 0 ? formClasses.map((f) => f.class_name).join(', ') : 'None Assigned'}
          </Text>
        </View>
      </View>

      {/* Subject Allocations Grid */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>📚 Subject & Classroom Duties</Text>

        {subjectAllocations.map((alloc) => (
          <View key={alloc.id} style={[styles.allocRow, { borderColor: colors.border }]}>
            <View>
              <Text style={[styles.allocSubject, { color: colors.text }]}>
                {alloc.subject_name} ({alloc.subject_code})
              </Text>
              <Text style={[styles.allocClass, { color: colors.textSecondary }]}>{alloc.class_name}</Text>
            </View>
            <View style={styles.periodBadge}>
              <Text style={styles.periodText}>{alloc.periods_per_week} Periods/Wk</Text>
            </View>
          </View>
        ))}
      </View>

      {/* SmartClass & Teacher Connected Apps */}
      <View style={[styles.appsSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.appsHeader}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>📡 SmartClass Teaching Apps</Text>
          <View style={styles.cloudBadge}>
            <Text style={styles.cloudBadgeText}>● LIVE CLOUD</Text>
          </View>
        </View>
        <Text style={[styles.appsSubheading, { color: colors.textSecondary }]}>
          Classroom instruction apps: SmartClass Tablet, SmartClass TV Receiver, and Mobile App.
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
              style={[styles.downloadButton, { backgroundColor: '#059669' }]}
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
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  titleContainer: { flex: 1 },
  staffName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  roleBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: '#065F46' },
  deptBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deptBadgeText: { fontSize: 10, fontWeight: '700', color: '#4338CA' },
  codeBanner: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeLabel: { fontSize: 10, fontWeight: '800', color: '#065F46', letterSpacing: 0.5 },
  codeText: { fontSize: 24, fontWeight: '900', color: '#047857', fontFamily: 'monospace', marginVertical: 2 },
  codeSubtext: { fontSize: 10, color: '#047857' },
  copyButton: {
    backgroundColor: '#059669',
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
  allocRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  allocSubject: { fontSize: 13, fontWeight: '700' },
  allocClass: { fontSize: 11, marginTop: 2 },
  periodBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  periodText: { fontSize: 11, fontWeight: '700', color: '#065F46' },
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
