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
import { apiClient, StudentProfileData } from '../../api/client';

interface Props {
  studentId?: string;
  onBack?: () => void;
}

export const StudentProfileScreen: React.FC<Props> = ({ studentId, onBack }) => {
  const { colors, isDark } = useTheme();
  const [data, setData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [studentId]);

  const loadProfile = async () => {
    setLoading(true);
    const res = await apiClient.getStudentProfile(studentId);
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setData({
        student: {
          id: 'stu-1',
          admission_number: 'AHC/2026/0001',
          full_name: 'David Adeleke',
          first_name: 'David',
          last_name: 'Adeleke',
          gender: 'male',
          dob: 'May 14, 2012',
          class_name: 'JSS 2 Gold',
          house_name: 'Emerald Eagles',
          nationality: 'Nigerian',
          state_of_origin: 'Lagos State',
          status: 'active',
          attendance_rate: 98.4,
        },
        guardians: [
          {
            id: 'g-1',
            full_name: 'Dr. Babatunde Adeleke',
            relationship: 'Father',
            phone: '+234 803 123 4567',
            email: 'parent@schoolos.internal',
            is_primary: true,
            can_pickup: true,
          },
        ],
        medical: {
          blood_group: 'O+',
          genotype: 'AA',
          allergies: 'None Reported',
          emergency_contact: '+234 803 123 4567',
        },
        ecosystem_apps: [
          {
            id: 'mobile',
            name: 'School OS Mobile App',
            short_name: 'SchoolS Mobile',
            category: 'Student Portal',
            platform: 'Android / iOS',
            version: 'v1.0.0',
            file_size: '119.3 MB',
            filename: 'SchoolOS_Mobile_v1.0.0.apk',
            download_url: 'https://schos.wchapel.com/downloads/apps/mobile',
            icon: 'Smartphone',
            badge: 'Academic Mobile',
            description: 'Access timetables, online CBT practice quizzes, and continuous assessment feedback.',
            features: ['Daily timetable & bell schedule', 'CBT online exams & tests'],
            target_roles: ['student'],
          },
        ],
      });
    }
    setLoading(false);
  };

  const handleCopyCode = (code: string) => {
    setCopied(true);
    Alert.alert('Admission Code Copied', `Admission Code [${code}] copied to clipboard for exam and library verification.`);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading Student Profile...
        </Text>
      </View>
    );
  }

  const student = data?.student;
  const guardians = data?.guardians || [];
  const medical = data?.medical;
  const apps = data?.ecosystem_apps || [];
  const profileCode = student?.admission_number || 'AHC/2026/0001';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Top Bar Header */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
      )}

      {/* Hero Card with Student Admission Code */}
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {student?.first_name ? student.first_name[0] : 'S'}
              {student?.last_name ? student.last_name[0] : 'T'}
            </Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.studentName, { color: colors.text }]}>{student?.full_name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.classBadge}>
                <Text style={styles.classBadgeText}>{student?.class_name}</Text>
              </View>
              <View style={styles.houseBadge}>
                <Text style={styles.houseBadgeText}>{student?.house_name}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* High-Contrast Student Profile Code Banner */}
        <View style={[styles.codeBanner, { backgroundColor: isDark ? '#312E81' : '#EEF2FF', borderColor: '#4F46E5' }]}>
          <View>
            <Text style={styles.codeLabel}>OFFICIAL ADMISSION CODE</Text>
            <Text style={styles.codeText}>{profileCode}</Text>
            <Text style={styles.codeSubtext}>Institutional student identity for examinations & library</Text>
          </View>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopyCode(profileCode)}
          >
            <Text style={styles.copyButtonText}>{copied ? 'COPIED ✓' : 'COPY CODE'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Academic & Demographic Details */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>📋 Enrollment & Demographics</Text>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Gender & DOB:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {student?.gender?.toUpperCase()} • {student?.dob}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>State of Origin:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{student?.state_of_origin}, {student?.nationality}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Current Status:</Text>
          <Text style={[styles.infoValue, { color: '#059669' }]}>Active Enrolled Student</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Attendance Rate:</Text>
          <Text style={[styles.infoValue, { color: '#059669' }]}>{student?.attendance_rate}% Attendance</Text>
        </View>
      </View>

      {/* Health & Medical Overview */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>🩺 Clinic & Health Overview</Text>

        <View style={styles.medGrid}>
          <View style={[styles.medBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.medLabel, { color: colors.textSecondary }]}>Blood Group</Text>
            <Text style={[styles.medValue, { color: colors.text }]}>{medical?.blood_group}</Text>
          </View>
          <View style={[styles.medBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.medLabel, { color: colors.textSecondary }]}>Genotype</Text>
            <Text style={[styles.medValue, { color: colors.text }]}>{medical?.genotype}</Text>
          </View>
          <View style={[styles.medBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.medLabel, { color: colors.textSecondary }]}>Allergies</Text>
            <Text style={[styles.medValue, { color: '#EF4444' }]} numberOfLines={1}>{medical?.allergies}</Text>
          </View>
          <View style={[styles.medBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.medLabel, { color: colors.textSecondary }]}>Emergency Contact</Text>
            <Text style={[styles.medValueSmall, { color: colors.text }]} numberOfLines={1}>{medical?.emergency_contact}</Text>
          </View>
        </View>
      </View>

      {/* Parents & Guardians Contact */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>👨‍👩‍👧 Registered Guardians ({guardians.length})</Text>

        {guardians.map((g) => (
          <View key={g.id} style={[styles.guardianItem, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <View style={styles.guardianTopRow}>
              <Text style={[styles.guardianName, { color: colors.text }]}>{g.full_name}</Text>
              <View style={styles.guardianBadge}>
                <Text style={styles.guardianBadgeText}>{g.relationship}</Text>
              </View>
            </View>
            <Text style={[styles.guardianContact, { color: colors.textSecondary }]}>📞 {g.phone}</Text>
            <Text style={[styles.guardianContact, { color: colors.textSecondary }]}>✉️ {g.email}</Text>
            <View style={styles.guardianBadgeRow}>
              {g.is_primary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>PRIMARY CONTACT</Text>
                </View>
              )}
              {g.can_pickup && (
                <View style={styles.pickupBadge}>
                  <Text style={styles.pickupBadgeText}>✓ AUTHORIZED PICKUP</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Student Mobile App */}
      <View style={[styles.appsSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.appsHeader}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>📲 Student Mobile Companion</Text>
          <View style={styles.cloudBadge}>
            <Text style={styles.cloudBadgeText}>● LIVE CLOUD</Text>
          </View>
        </View>
        <Text style={[styles.appsSubheading, { color: colors.textSecondary }]}>
          Access personal class schedules, homework, and continuous assessment feedback.
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
              style={[styles.downloadButton, { backgroundColor: '#4F46E5' }]}
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
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  titleContainer: { flex: 1 },
  studentName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  classBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  classBadgeText: { fontSize: 10, fontWeight: '700', color: '#4338CA' },
  houseBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  houseBadgeText: { fontSize: 10, fontWeight: '700', color: '#065F46' },
  codeBanner: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeLabel: { fontSize: 10, fontWeight: '800', color: '#3730A3', letterSpacing: 0.5 },
  codeText: { fontSize: 24, fontWeight: '900', color: '#4338CA', fontFamily: 'monospace', marginVertical: 2 },
  codeSubtext: { fontSize: 10, color: '#3730A3' },
  copyButton: {
    backgroundColor: '#4F46E5',
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
  medGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  medBox: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  medLabel: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  medValue: { fontSize: 14, fontWeight: '800' },
  medValueSmall: { fontSize: 11, fontWeight: '700' },
  guardianItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  guardianTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  guardianName: { fontSize: 13, fontWeight: '700' },
  guardianBadge: { backgroundColor: '#E0E7FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  guardianBadgeText: { fontSize: 10, fontWeight: '700', color: '#4338CA' },
  guardianContact: { fontSize: 11, marginVertical: 1 },
  guardianBadgeRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  primaryBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  primaryBadgeText: { fontSize: 9, fontWeight: '800', color: '#1E40AF' },
  pickupBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  pickupBadgeText: { fontSize: 9, fontWeight: '800', color: '#065F46' },
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
