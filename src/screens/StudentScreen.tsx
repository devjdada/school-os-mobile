import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { apiClient, ActiveExam } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Props {
  onNavigate?: (screenId: string, examId?: string) => void;
}

interface Announcement {
  id: number;
  title: string;
  date: string;
  body: string;
}

export const StudentScreen: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [exams, setExams] = useState<ActiveExam[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getStudentDashboard();
      if (res.success && res.data) {
        setExams(res.data.active_exams || []);
        if (res.data.announcements && Array.isArray(res.data.announcements)) {
          setAnnouncements(res.data.announcements);
        }
      } else {
        setExams([]);
      }
    } catch {
      setExams([]);
    } finally {
      setLoading(false);
    }
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
      {/* Student Profile Card */}
      <View style={styles.profileCard}>
        <Text style={styles.profileRole}>STUDENT PORTAL</Text>
        <Text style={styles.profileName}>{user?.name || 'Enrolled Student'}</Text>
        <Text style={styles.profileEmail}>{user?.email || 'student@school.edu'}</Text>
        <TouchableOpacity
          style={styles.profileCodeBtn}
          onPress={() => onNavigate?.('profile_student')}
        >
          <Text style={styles.profileCodeBtnText}>🎒 View Student Profile & Admission Code →</Text>
        </TouchableOpacity>
      </View>

      {/* Online Computer-Based Tests (CBT) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Online Computer-Based Tests (CBT)</Text>

        {exams.length > 0 ? (
          <View style={styles.examList}>
            {exams.map(exam => (
              <View key={exam.id} style={styles.examCard}>
                <View style={styles.examInfo}>
                  <Text style={styles.examTitle}>{exam.title}</Text>
                  <Text style={styles.examMeta}>
                    ⏱ {exam.duration_minutes} Mins • 🎯 Pass Mark: {exam.pass_mark || 50}%
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
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Active Examinations</Text>
            <Text style={styles.emptySubtitle}>
              There are currently no active computer-based assessments scheduled for your class arm.
            </Text>
          </View>
        )}
      </View>

      {/* School Announcements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>School Noticeboard</Text>
        {announcements.length > 0 ? (
          announcements.map(ann => (
            <View key={ann.id} style={styles.noticeCard}>
              <Text style={styles.noticeDate}>{ann.date}</Text>
              <Text style={styles.noticeTitle}>{ann.title}</Text>
              <Text style={styles.noticeBody}>{ann.body}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Announcements</Text>
            <Text style={styles.emptySubtitle}>
              Check back later for school notices and updates.
            </Text>
          </View>
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
  profileCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  profileRole: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  profileName: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  profileEmail: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
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
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
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
    borderWidth: 1,
    borderColor: '#334155',
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
  emptyCard: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  profileCodeBtn: {
    backgroundColor: '#3B82F620',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F650',
    marginTop: 10,
    alignItems: 'center',
  },
  profileCodeBtnText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '700',
  },
});
