import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { apiClient, TeacherAppraisalScorecardData } from '../../api/client';

export const TeacherAppraisalScreen: React.FC = () => {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeacherAppraisalScorecardData | null>(null);

  // Self Review Form State
  const [showSelfForm, setShowSelfForm] = useState(false);
  const [selfScore, setSelfScore] = useState('85');
  const [evalNotes, setEvalNotes] = useState('');
  const [strengths, setStrengths] = useState('');
  const [growthGoals, setGrowthGoals] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadScorecard();
  }, []);

  const loadScorecard = async () => {
    setLoading(true);
    setAlertMsg(null);
    try {
      const res = await apiClient.getTeacherAppraisalScorecard();
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.appraisal?.self_appraisal_score) {
          setSelfScore(String(res.data.appraisal.self_appraisal_score));
          setEvalNotes(res.data.appraisal.self_evaluation_notes || '');
          setStrengths(res.data.appraisal.strengths || '');
          setGrowthGoals(res.data.appraisal.growth_goals || '');
        }
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to load scorecard' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSelfReview = async () => {
    if (!data?.term_id || !data?.session_id) {
      setAlertMsg({ type: 'error', text: 'Current term or session context missing.' });
      return;
    }
    if (!evalNotes.trim()) {
      setAlertMsg({ type: 'error', text: 'Please provide self-evaluation reflection notes.' });
      return;
    }

    setSubmitting(true);
    setAlertMsg(null);

    const res = await apiClient.submitTeacherSelfReview({
      term_id: data.term_id,
      session_id: data.session_id,
      self_appraisal_score: parseFloat(selfScore) || 80,
      self_evaluation_notes: evalNotes.trim(),
      strengths: strengths.trim() || undefined,
      growth_goals: growthGoals.trim() || undefined,
    });

    if (res.success) {
      setAlertMsg({ type: 'success', text: 'Self-evaluation and growth goals saved successfully.' });
      setShowSelfForm(false);
      await loadScorecard();
    } else {
      setAlertMsg({ type: 'error', text: res.message || 'Failed to submit self-review.' });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading Faculty Appraisal Scorecard...
        </Text>
      </View>
    );
  }

  const appraisal = data?.appraisal;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Faculty KPI Scorecard</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {data?.session_name} • {data?.term_name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowSelfForm(prev => !prev)}
          style={[styles.selfBtn, { backgroundColor: showSelfForm ? colors.border : colors.primary }]}
        >
          <Text style={[styles.selfBtnText, { color: showSelfForm ? colors.textPrimary : '#FFFFFF' }]}>
            {showSelfForm ? 'Cancel' : (appraisal?.self_appraisal_score ? 'Edit Self-Review' : '+ Self-Review')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      {alertMsg && (
        <View
          style={[
            styles.alertBox,
            {
              backgroundColor: alertMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: alertMsg.type === 'success' ? colors.success : colors.danger,
            },
          ]}
        >
          <Text
            style={[
              styles.alertText,
              { color: alertMsg.type === 'success' ? colors.success : colors.danger },
            ]}
          >
            {alertMsg.text}
          </Text>
        </View>
      )}

      {/* Overall Score Banner */}
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.heroLeft}>
          <Text style={[styles.scoreBig, { color: colors.primary }]}>
            {appraisal ? `${appraisal.total_composite_score}%` : 'Pending'}
          </Text>
          <Text style={[styles.gradeText, { color: colors.success }]}>
            {appraisal?.performance_grade || 'Under Evaluation'}
          </Text>
          <Text style={[styles.statusTag, { color: colors.textSecondary }]}>
            Status: {(appraisal?.status || 'draft').toUpperCase()}
          </Text>
        </View>

        {appraisal?.self_appraisal_score && (
          <View style={[styles.heroRight, { borderLeftColor: colors.border }]}>
            <Text style={[styles.selfLabel, { color: colors.textSecondary }]}>Self-Rating:</Text>
            <Text style={[styles.selfScore, { color: colors.warning }]}>
              {appraisal.self_appraisal_score}%
            </Text>
          </View>
        )}
      </View>

      {/* Self Review Form */}
      {showSelfForm && (
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Educator Self-Evaluation</Text>
          <Text style={[styles.formSub, { color: colors.textSecondary }]}>
            Reflect on your term performance, student outcomes, and growth targets.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Self-Rating Score (0 - 100)</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              keyboardType="numeric"
              value={selfScore}
              onChangeText={setSelfScore}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Self-Reflection & Summary</Text>
            <TextInput
              style={[styles.textArea, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Reflect on your teaching achievements, student challenges overcome..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={evalNotes}
              onChangeText={setEvalNotes}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Key Pedagogical Strengths</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="e.g. Student engagement, technology adoption..."
              placeholderTextColor={colors.textSecondary}
              value={strengths}
              onChangeText={setStrengths}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Professional Growth Goals</Text>
            <TextInput
              style={[styles.textArea, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Target certifications, new methodologies to implement..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
              value={growthGoals}
              onChangeText={setGrowthGoals}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmitSelfReview}
            disabled={submitting}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Save Self-Evaluation</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* KPI Metrics Breakdown */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 8 }]}>
        Objective KPI Metrics Breakdown
      </Text>

      {data?.scores.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            KPI evaluation scores will populate automatically upon attendance and grade submissions.
          </Text>
        </View>
      ) : (
        <View style={styles.metricsList}>
          {data?.scores.map((s, idx) => (
            <View
              key={idx}
              style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.metricTop}>
                <Text style={[styles.metricTitle, { color: colors.textPrimary }]}>{s.metric_title}</Text>
                <Text style={[styles.metricScore, { color: colors.primary }]}>{s.score}%</Text>
              </View>
              <View style={styles.metricBottom}>
                <Text style={[styles.metricCat, { color: colors.textSecondary }]}>
                  Category: {s.category} (Weight: {s.weight}%)
                </Text>
                <Text style={[styles.weightedScore, { color: colors.success }]}>
                  +{s.weighted_score} pts
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Leadership Remarks */}
      {appraisal?.principal_remarks && (
        <View style={[styles.remarksCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.remarksLabel, { color: colors.primary }]}>Principal / HOD Evaluation Remarks:</Text>
          <Text style={[styles.remarksText, { color: colors.textPrimary }]}>{appraisal.principal_remarks}</Text>
        </View>
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
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  selfBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selfBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '500',
  },
  heroCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
  },
  heroLeft: {
    flex: 1,
    gap: 4,
  },
  scoreBig: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusTag: {
    fontSize: 11,
    marginTop: 2,
  },
  heroRight: {
    borderLeftWidth: 1,
    paddingLeft: 16,
    alignItems: 'center',
    gap: 4,
  },
  selfLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  selfScore: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  formCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  formSub: {
    fontSize: 11,
    marginTop: -4,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  submitBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  metricsList: {
    gap: 8,
  },
  metricCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  metricBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCat: {
    fontSize: 11,
  },
  weightedScore: {
    fontSize: 11,
    fontWeight: '600',
  },
  remarksCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  remarksLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  remarksText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
