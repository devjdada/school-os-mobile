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
import { apiClient, ReliefDutyItem } from '../../api/client';

export const TeacherCoverageScreen: React.FC = () => {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [duties, setDuties] = useState<ReliefDutyItem[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);
  const [showExitForm, setShowExitForm] = useState(false);
  const [reportText, setReportText] = useState<{ [id: string]: string }>({});

  // Exit Form state
  const [exitDate, setExitDate] = useState('');
  const [periodStart, setPeriodStart] = useState('1');
  const [periodEnd, setPeriodEnd] = useState('2');
  const [returnTime, setReturnTime] = useState('');
  const [exitReason, setExitReason] = useState('');
  const [submittingExit, setSubmittingExit] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadDuties();
  }, []);

  const loadDuties = async () => {
    setLoading(true);
    setAlertMsg(null);
    try {
      const res = await apiClient.getTeacherReliefDuties();
      if (res.success && res.data) {
        setDuties(res.data);
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to load relief assignments' });
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    setActingId(id);
    const res = await apiClient.acknowledgeReliefDuty(id);
    if (res.success) {
      setAlertMsg({ type: 'success', text: 'Relief duty acknowledged.' });
      await loadDuties();
    } else {
      setAlertMsg({ type: 'error', text: res.message || 'Could not acknowledge duty.' });
    }
    setActingId(null);
  };

  const handleComplete = async (id: string) => {
    setActingId(id);
    const report = reportText[id] || 'Class conducted in accordance with syllabus notes.';
    const res = await apiClient.completeReliefDuty(id, report);
    if (res.success) {
      setAlertMsg({ type: 'success', text: 'Relief duty marked as completed.' });
      await loadDuties();
    } else {
      setAlertMsg({ type: 'error', text: res.message || 'Could not complete duty.' });
    }
    setActingId(null);
  };

  const handleSubmitExit = async () => {
    if (!exitDate || !exitReason.trim()) {
      setAlertMsg({ type: 'error', text: 'Please fill in date and reason.' });
      return;
    }

    setSubmittingExit(true);
    setAlertMsg(null);

    const res = await apiClient.requestExitPermission({
      date: exitDate.trim(),
      period_start: parseInt(periodStart, 10) || 1,
      period_end: parseInt(periodEnd, 10) || 1,
      expected_return_time: returnTime.trim() || undefined,
      reason: exitReason.trim(),
    });

    if (res.success) {
      setAlertMsg({ type: 'success', text: 'Classroom exit request submitted for administrative approval.' });
      setExitDate('');
      setExitReason('');
      setReturnTime('');
      setShowExitForm(false);
    } else {
      setAlertMsg({ type: 'error', text: res.message || 'Failed to submit exit request.' });
    }
    setSubmittingExit(false);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading Coverage Roster...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header Banner */}
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Classroom Coverage</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Relief duties & classroom exits</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowExitForm(prev => !prev)}
          style={[styles.toggleBtn, { backgroundColor: showExitForm ? colors.border : colors.primary }]}
        >
          <Text style={[styles.toggleBtnText, { color: showExitForm ? colors.textPrimary : '#FFFFFF' }]}>
            {showExitForm ? 'Cancel' : '+ Request Exit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications / Alerts */}
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

      {/* Exit Permission Form */}
      {showExitForm && (
        <View style={[styles.exitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Request Short Classroom Exit</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="2026-11-25"
              placeholderTextColor={colors.textSecondary}
              value={exitDate}
              onChangeText={setExitDate}
            />
          </View>

          <View style={styles.periodRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>From Period</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                keyboardType="numeric"
                value={periodStart}
                onChangeText={setPeriodStart}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>To Period</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                keyboardType="numeric"
                value={periodEnd}
                onChangeText={setPeriodEnd}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Expected Return Time (e.g. 11:30 AM)</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="11:30"
              placeholderTextColor={colors.textSecondary}
              value={returnTime}
              onChangeText={setReturnTime}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Reason for Short Exit</Text>
            <TextInput
              style={[styles.textArea, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Urgent errand / medical check / administrative meeting..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
              value={exitReason}
              onChangeText={setExitReason}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmitExit}
            disabled={submittingExit}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          >
            {submittingExit ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Exit Request</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Assigned Relief Duties */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 8 }]}>Assigned Relief Classes</Text>

      {duties.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No relief teaching duties assigned for you at this time.
          </Text>
        </View>
      ) : (
        <View style={styles.dutyList}>
          {duties.map(duty => (
            <View
              key={duty.id}
              style={[styles.dutyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.dutyHeader}>
                <View style={[styles.periodBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.periodBadgeText}>P{duty.period_number}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.subjectName, { color: colors.textPrimary }]}>{duty.subject_name}</Text>
                  <Text style={[styles.className, { color: colors.textSecondary }]}>
                    {duty.class_name} • {duty.coverage_date}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        duty.status === 'completed'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : duty.status === 'acknowledged'
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color:
                          duty.status === 'completed'
                            ? colors.success
                            : duty.status === 'acknowledged'
                            ? colors.info
                            : colors.warning,
                      },
                    ]}
                  >
                    {duty.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[styles.absentMeta, { color: colors.textSecondary }]}>
                Covering for: <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{duty.absent_teacher}</Text>
              </Text>

              {duty.handover_notes && (
                <View style={[styles.notesBox, { backgroundColor: 'rgba(255, 255, 255, 0.04)' }]}>
                  <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Lesson Instructions:</Text>
                  <Text style={[styles.notesContent, { color: colors.textPrimary }]}>{duty.handover_notes}</Text>
                </View>
              )}

              {/* Action Buttons */}
              {duty.status === 'assigned' && (
                <TouchableOpacity
                  onPress={() => handleAcknowledge(duty.id)}
                  disabled={actingId === duty.id}
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                >
                  {actingId === duty.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.actionBtnText}>Acknowledge Duty</Text>
                  )}
                </TouchableOpacity>
              )}

              {duty.status === 'acknowledged' && (
                <View style={styles.completeSection}>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="Brief report (e.g. Exercises completed on page 42)..."
                    placeholderTextColor={colors.textSecondary}
                    value={reportText[duty.id] || ''}
                    onChangeText={text => setReportText(prev => ({ ...prev, [duty.id]: text }))}
                  />
                  <TouchableOpacity
                    onPress={() => handleComplete(duty.id)}
                    disabled={actingId === duty.id}
                    style={[styles.actionBtn, { backgroundColor: colors.success, marginTop: 6 }]}
                  >
                    {actingId === duty.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.actionBtnText}>Mark Class Completed</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
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
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleBtnText: {
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  exitCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  periodRow: {
    flexDirection: 'row',
    gap: 10,
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
  },
  dutyList: {
    gap: 10,
  },
  dutyCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  dutyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  className: {
    fontSize: 12,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  absentMeta: {
    fontSize: 12,
  },
  notesBox: {
    padding: 8,
    borderRadius: 8,
    gap: 2,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  notesContent: {
    fontSize: 12,
  },
  actionBtn: {
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  completeSection: {
    gap: 4,
  },
});
