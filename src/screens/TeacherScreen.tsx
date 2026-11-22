import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { apiClient, TimetablePeriod, TeacherProfileData } from '../api/client';

export const TeacherScreen: React.FC = () => {
  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [periods, setPeriods] = useState<TimetablePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState([
    { id: '1', name: 'Chioma Okeke', status: 'present' },
    { id: '2', name: 'Babajide Fashola', status: 'present' },
    { id: '3', name: 'Zainab Ahmed', status: 'absent' },
    { id: '4', name: 'Emeka Chukwu', status: 'present' },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [profileRes, timetableRes] = await Promise.all([
      apiClient.getTeacherProfile(),
      apiClient.getTeacherTimetable(),
    ]);

    if (profileRes.success && profileRes.data) {
      setProfile(profileRes.data);
    }

    if (timetableRes.success && timetableRes.data && timetableRes.data.length > 0) {
      setPeriods(timetableRes.data);
      // Fetch roster for first class arm if available
      const firstArmId = timetableRes.data[0].class_arm_id;
      if (firstArmId) {
        const rosterRes = await apiClient.getClassRoster(firstArmId);
        if (rosterRes.success && rosterRes.data && rosterRes.data.length > 0) {
          setRoster(rosterRes.data.map((s: any) => ({
            id: String(s.id),
            name: s.full_name || s.name,
            status: 'present',
          })));
        }
      }
    } else {
      setPeriods([]);
    }
    setLoading(false);
  };

  const toggleStatus = (id: string) => {
    setRoster(prev =>
      prev.map(s => {
        if (s.id === id) {
          return { ...s, status: s.status === 'present' ? 'absent' : 'present' };
        }
        return s;
      })
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading Faculty Timetable...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Staff Employment & Banking Profile Card */}
      {profile && (
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profile.full_name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileMain}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{profile.full_name}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{profile.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.profileDesignation}>
                {profile.designation} • {profile.department}
              </Text>
              <Text style={styles.staffIdBadge}>ID: {profile.staff_id_number}</Text>
            </View>
          </View>

          <View style={styles.profileDivider} />

          <View style={styles.bankingSection}>
            <View style={styles.bankingRow}>
              <Text style={styles.bankingLabel}>Salary Account:</Text>
              <Text style={styles.bankingVal}>
                {profile.banking.bank_name} ({profile.banking.account_number_masked})
              </Text>
            </View>
            <View style={styles.bankingRow}>
              <Text style={styles.bankingLabel}>Pension PFA:</Text>
              <Text style={styles.bankingVal}>{profile.banking.pension_pfa}</Text>
            </View>
            {profile.confirmation_date && (
              <View style={styles.bankingRow}>
                <Text style={styles.bankingLabel}>Confirmed:</Text>
                <Text style={styles.bankingVal}>{profile.confirmation_date}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Today's Teaching Schedule</Text>

      {/* Period Cards */}
      <View style={styles.periodList}>
        {periods.length === 0 ? (
          <View style={[styles.periodCard, { padding: 20, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center' }}>
              No scheduled teaching periods assigned for today.
            </Text>
          </View>
        ) : (
          periods.map((p) => (
            <View key={p.id} style={styles.periodCard}>
              <View style={styles.periodBadge}>
                <Text style={styles.periodNum}>P{p.period_number}</Text>
              </View>
              <View style={styles.periodInfo}>
                <Text style={styles.subjectName}>{p.subject_name}</Text>
                <Text style={styles.periodMeta}>
                  {p.class_name} • {p.room} • {p.time_slot}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Rapid Attendance Roll Call */}
      <View style={styles.rosterCard}>
        <View style={styles.rosterHeader}>
          <Text style={styles.rosterTitle}>
            Rapid Class Roll Call ({periods[0]?.class_name || 'Classroom'})
          </Text>
          <Text style={styles.rosterCount}>
            {roster.filter((r) => r.status === 'present').length}/{roster.length} Present
          </Text>
        </View>

        {roster.length === 0 ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center' }}>
              Roll call roster is currently empty for this period.
            </Text>
          </View>
        ) : (
          <View style={styles.studentGrid}>
            {roster.map((student) => (
              <TouchableOpacity
                key={student.id}
                onPress={() => toggleStatus(student.id)}
                style={[
                  styles.studentChip,
                  student.status === 'present' ? styles.chipPresent : styles.chipAbsent,
                ]}
              >
                <Text
                  style={[
                    styles.studentChipText,
                    student.status === 'present' ? styles.textPresent : styles.textAbsent,
                  ]}
                >
                  {student.status === 'present' ? '✓ ' : '✗ '}
                  {student.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {roster.length > 0 && (
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save Roll Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 14,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  periodList: {
    gap: 10,
  },
  periodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  periodBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodNum: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  periodInfo: {
    flex: 1,
  },
  subjectName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: 'bold',
  },
  periodMeta: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  rosterCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    gap: 14,
    marginTop: 8,
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rosterTitle: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rosterCount: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 13,
  },
  studentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  studentChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipPresent: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  chipAbsent: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderColor: '#F43F5E',
  },
  studentChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textPresent: {
    color: '#34D399',
  },
  textAbsent: {
    color: '#FB7185',
  },
  saveBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileMain: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileDesignation: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  staffIdBadge: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  profileDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  bankingSection: {
    gap: 6,
  },
  bankingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankingLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  bankingVal: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '500',
  },
});
