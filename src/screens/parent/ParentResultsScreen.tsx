import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { apiClient, ChildTerminalResult } from '../../api/client';

interface Props {
  studentId?: string;
  onBack?: () => void;
}

export const ParentResultsScreen: React.FC<Props> = ({ studentId = '1', onBack }) => {
  const { colors } = useTheme();
  const [result, setResult] = useState<ChildTerminalResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [studentId]);

  const loadResults = async () => {
    setLoading(true);
    const res = await apiClient.getChildResults(studentId);
    if (res.success && res.data) {
      setResult(res.data);
    } else {
      // Standalone preview mock
      setResult({
        term_name: 'First Term Examination',
        session_name: '2026/2027 Academic Session',
        class_name: 'JSS 1 Gold',
        total_obtainable: 500,
        total_obtained: 428,
        average_score: 85.6,
        position_in_class: '3rd of 34 Students',
        principal_remarks: 'An outstanding performance. Kehinde demonstrates analytical excellence.',
        teacher_remarks: 'Very attentive and helpful in classroom laboratory exercises.',
        financial_clearance: true,
        subjects: [
          { subject_id: 's1', subject_name: 'Mathematics', ca_score: 36, exam_score: 54, total_score: 90, grade: 'A1', remarks: 'Distinction' },
          { subject_id: 's2', subject_name: 'English Language', ca_score: 32, exam_score: 49, total_score: 81, grade: 'A1', remarks: 'Distinction' },
          { subject_id: 's3', subject_name: 'Basic Science & Technology', ca_score: 35, exam_score: 51, total_score: 86, grade: 'A1', remarks: 'Distinction' },
          { subject_id: 's4', subject_name: 'Business Studies', ca_score: 30, exam_score: 52, total_score: 82, grade: 'A1', remarks: 'Distinction' },
          { subject_id: 's5', subject_name: 'Civic Education', ca_score: 34, exam_score: 55, total_score: 89, grade: 'A1', remarks: 'Distinction' },
        ],
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Terminal Report Card...</Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>No published terminal report found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.topBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: colors.textPrimary }]}>Terminal Academic Report</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{result.session_name} • {result.term_name}</Text>
      </View>

      {/* Financial Clearance Gate Banner */}
      {!result.financial_clearance ? (
        <View style={[styles.lockCard, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🔒</Text>
          <Text style={[styles.lockTitle, { color: colors.danger }]}>Financial Clearance Required</Text>
          <Text style={[styles.lockDesc, { color: colors.textSecondary }]}>
            The academic report card for this term is currently locked due to outstanding school fees.
            Please settle the pending invoice balance to immediately unlock the full grade transcript.
          </Text>
        </View>
      ) : (
        <>
          {/* Performance Overview Banner */}
          <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Average</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>{result.average_score}%</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Position</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{result.position_in_class}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Score</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>{result.total_obtained}/{result.total_obtainable}</Text>
              </View>
            </View>
          </View>

          {/* Subject Breakdown Table */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Subject Grades & Continuous Assessment</Text>
          <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Table Header */}
            <View style={[styles.tableHeader, { borderBottomColor: colors.border, backgroundColor: colors.surfaceHighlight }]}>
              <Text style={[styles.thSubj, { color: colors.textPrimary }]}>Subject</Text>
              <Text style={[styles.thNum, { color: colors.textPrimary }]}>CA</Text>
              <Text style={[styles.thNum, { color: colors.textPrimary }]}>Exam</Text>
              <Text style={[styles.thNum, { color: colors.textPrimary }]}>Total</Text>
              <Text style={[styles.thGrade, { color: colors.textPrimary }]}>Grade</Text>
            </View>

            {/* Table Rows */}
            {result.subjects.map((subj, idx) => (
              <View
                key={subj.subject_id}
                style={[
                  styles.tableRow,
                  idx < result.subjects.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                ]}
              >
                <View style={styles.tdSubj}>
                  <Text style={[styles.subjName, { color: colors.textPrimary }]}>{subj.subject_name}</Text>
                  <Text style={[styles.subjRemark, { color: colors.textMuted }]}>{subj.remarks}</Text>
                </View>
                <Text style={[styles.tdNum, { color: colors.textSecondary }]}>{subj.ca_score}</Text>
                <Text style={[styles.tdNum, { color: colors.textSecondary }]}>{subj.exam_score}</Text>
                <Text style={[styles.tdNum, { color: colors.textPrimary, fontWeight: '700' }]}>{subj.total_score}</Text>
                <View style={styles.tdGrade}>
                  <View style={[styles.gradePill, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.gradeText, { color: colors.primary }]}>{subj.grade}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Teacher and Principal Remarks */}
          <View style={[styles.remarksCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.remarkHeader, { color: colors.textPrimary }]}>Class Teacher's Remark</Text>
            <Text style={[styles.remarkBody, { color: colors.textSecondary }]}>"{result.teacher_remarks}"</Text>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.remarkHeader, { color: colors.textPrimary }]}>Principal's Signature Remark</Text>
            <Text style={[styles.remarkBody, { color: colors.textSecondary }]}>"{result.principal_remarks}"</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  topBar: {
    marginBottom: 16,
  },
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  lockCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  lockTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  lockDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#334155',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  tableCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  thSubj: {
    flex: 2,
    fontSize: 12,
    fontWeight: '700',
  },
  thNum: {
    width: 44,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  thGrade: {
    width: 44,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tdSubj: {
    flex: 2,
  },
  subjName: {
    fontSize: 13,
    fontWeight: '600',
  },
  subjRemark: {
    fontSize: 11,
    marginTop: 1,
  },
  tdNum: {
    width: 44,
    fontSize: 13,
    textAlign: 'center',
  },
  tdGrade: {
    width: 44,
    alignItems: 'center',
  },
  gradePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  remarksCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  remarkHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  remarkBody: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
});
