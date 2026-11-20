import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { apiClient, TimetablePeriod } from '../api/client';

export const TeacherScreen: React.FC = () => {
  const [periods, setPeriods] = useState<TimetablePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState([
    { id: '1', name: 'Chioma Okeke', status: 'present' },
    { id: '2', name: 'Babajide Fashola', status: 'present' },
    { id: '3', name: 'Zainab Ahmed', status: 'absent' },
    { id: '4', name: 'Emeka Chukwu', status: 'present' },
  ]);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    setLoading(true);
    const res = await apiClient.getTeacherTimetable();
    if (res.success && res.data && res.data.length > 0) {
      setPeriods(res.data);
    } else {
      setPeriods([
        {
          id: '1',
          period_number: 1,
          subject_name: 'Mathematics',
          class_name: 'JSS 1 Gold',
          class_arm_id: 'arm-1',
          time_slot: '08:00 - 08:45',
          room: 'Room 101',
        },
        {
          id: '2',
          period_number: 2,
          subject_name: 'Further Mathematics',
          class_name: 'SSS 1 Science A',
          class_arm_id: 'arm-2',
          time_slot: '08:45 - 09:30',
          room: 'Science Lab 2',
        },
      ]);
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
      <Text style={styles.sectionTitle}>Today's Teaching Schedule</Text>

      {/* Period Cards */}
      <View style={styles.periodList}>
        {periods.map(p => (
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
        ))}
      </View>

      {/* Rapid Attendance Roll Call */}
      <View style={styles.rosterCard}>
        <View style={styles.rosterHeader}>
          <Text style={styles.rosterTitle}>Rapid Class Roll Call (JSS 1 Gold)</Text>
          <Text style={styles.rosterCount}>
            {roster.filter(r => r.status === 'present').length}/{roster.length} Present
          </Text>
        </View>

        <View style={styles.studentGrid}>
          {roster.map(student => (
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

        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save Roll Call</Text>
        </TouchableOpacity>
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
});
