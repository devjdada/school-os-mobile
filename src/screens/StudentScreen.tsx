import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { apiClient, ActiveExam } from '../api/client';

interface Props {
  onNavigate?: (screenId: string, examId?: string) => void;
}

export const StudentScreen: React.FC<Props> = ({ onNavigate }) => {
  const [exams, setExams] = useState<ActiveExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const res = await apiClient.getStudentDashboard();
    if (res.success && res.data && res.data.active_exams) {
      setExams(res.data.active_exams);
    } else {
      setExams([
        {
          id: '1',
          title: 'Mathematics First Term Examination 2026',
          duration_minutes: 60,
          total_marks: 100,
        },
        {
          id: '2',
          title: 'Basic Science & Technology Assessment',
          duration_minutes: 30,
          total_marks: 40,
        },
      ]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Connecting Student Portal...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Canteen Wallet Card */}
      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>My Tuck Shop Wallet</Text>
        <Text style={styles.walletBalance}>₦12,500.00</Text>
        <Text style={styles.walletUid}>Smartcard UID: RFID-TOBI-99</Text>
      </View>

      {/* Online Computer-Based Tests (CBT) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Online Computer-Based Tests (CBT)</Text>

        <View style={styles.examList}>
          {exams.map(exam => (
            <View key={exam.id} style={styles.examCard}>
              <View>
                <Text style={styles.examTitle}>{exam.title}</Text>
                <Text style={styles.examMeta}>
                  ⏱ {exam.duration_minutes} Mins • 🎯 {exam.total_marks} Marks
                </Text>
              </View>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => onNavigate && onNavigate('student_cbt', exam.id)}
              >
                <Text style={styles.startBtnText}>Launch CBT →</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Daily Homework & Announcements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>School Noticeboard</Text>
        <View style={styles.noticeCard}>
          <Text style={styles.noticeDate}>Today, 08:30 AM</Text>
          <Text style={styles.noticeTitle}>Mid-Term Resumption & Sports Kit</Text>
          <Text style={styles.noticeBody}>
            Inter-house athletics heats will take place this Thursday. Please ensure your house jersey is ready.
          </Text>
        </View>
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
    gap: 18,
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
  walletCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  walletLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  walletBalance: {
    color: '#10B981',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  walletUid: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'monospace',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  examList: {
    gap: 10,
  },
  examCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  examTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
    maxWidth: 200,
  },
  examMeta: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  startBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  noticeCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    gap: 6,
  },
  noticeDate: {
    color: '#64748B',
    fontSize: 11,
  },
  noticeTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noticeBody: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
});
