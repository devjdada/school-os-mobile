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
import { apiClient, StaffAttendanceMonthlySummary } from '../../api/client';

export const TeacherAttendanceScreen: React.FC = () => {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<StaffAttendanceMonthlySummary | null>(null);
  const [showRegForm, setShowRegForm] = useState(false);

  // Regularization Form State
  const [regDate, setRegDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('07:45');
  const [checkOutTime, setCheckOutTime] = useState('16:00');
  const [reasonType, setReasonType] = useState('forgot_to_clock');
  const [reasonDesc, setReasonDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    setAlertMsg(null);
    try {
      const res = await apiClient.getTeacherAttendanceSummary();
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to load attendance records' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRegularization = async () => {
    if (!regDate || !reasonDesc.trim()) {
      setAlertMsg({ type: 'error', text: 'Please fill in the date and detailed explanation.' });
      return;
    }

    setSubmitting(true);
    setAlertMsg(null);

    const res = await apiClient.submitAttendanceRegularization({
      date: regDate.trim(),
      requested_check_in: checkInTime.trim() || undefined,
      requested_check_out: checkOutTime.trim() || undefined,
      reason_type: reasonType,
      reason_description: reasonDesc.trim(),
    });

    if (res.success) {
      setAlertMsg({ type: 'success', text: 'Regularization request submitted to HR for approval.' });
      setRegDate('');
      setReasonDesc('');
      setShowRegForm(false);
    } else {
      setAlertMsg({ type: 'error', text: res.message || 'Could not submit regularization request.' });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading Attendance Ledger...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header & Regularize Button */}
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Staff Attendance</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {summary ? `Ledger for ${summary.month}/${summary.year}` : 'Current Month'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowRegForm(prev => !prev)}
          style={[styles.toggleBtn, { backgroundColor: showRegForm ? colors.border : colors.primary }]}
        >
          <Text style={[styles.toggleBtnText, { color: showRegForm ? colors.textPrimary : '#FFFFFF' }]}>
            {showRegForm ? 'Cancel' : '+ Regularize'}
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

      {/* KPI Cards */}
      {summary && (
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.kpiVal, { color: colors.success }]}>{summary.total_present}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Days Present</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.kpiVal, { color: colors.primary }]}>{summary.punctuality_percentage}%</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Punctuality</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.kpiVal, { color: colors.warning }]}>{summary.total_late}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Days Late</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.kpiVal, { color: colors.textPrimary }]}>{summary.total_late_minutes}m</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Latency</Text>
          </View>
        </View>
      )}

      {/* Regularization Form */}
      {showRegForm && (
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Request Attendance Regularization</Text>
          <Text style={[styles.formHelp, { color: colors.textSecondary }]}>
            Submit when you forgot to clock in, had biometric/RFID reader issues, or were on official duty.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="2026-11-20"
              placeholderTextColor={colors.textSecondary}
              value={regDate}
              onChangeText={setRegDate}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Actual Resumption</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                value={checkInTime}
                onChangeText={setCheckInTime}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Actual Departure</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                value={checkOutTime}
                onChangeText={setCheckOutTime}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Detailed Reason</Text>
            <TextInput
              style={[styles.textArea, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Explain why you could not clock in normally..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={reasonDesc}
              onChangeText={setReasonDesc}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmitRegularization}
            disabled={submitting}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Regularization</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Daily Records List */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 10 }]}>Monthly Log Details</Text>

      {summary?.records.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No clock-in records logged this month.</Text>
        </View>
      ) : (
        <View style={styles.recordList}>
          {summary?.records.map((r, idx) => (
            <View
              key={idx}
              style={[styles.recordRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View>
                <Text style={[styles.recordDate, { color: colors.textPrimary }]}>{r.date}</Text>
                <Text style={[styles.recordTime, { color: colors.textSecondary }]}>
                  {r.check_in_time || '—'} → {r.check_out_time || '—'}
                  {r.mode ? ` (${r.mode})` : ''}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      r.status === 'present'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : r.status === 'late'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color:
                        r.status === 'present'
                          ? colors.success
                          : r.status === 'late'
                          ? colors.warning
                          : colors.danger,
                    },
                  ]}
                >
                  {r.status.toUpperCase()}
                  {r.late_minutes > 0 ? ` (+${r.late_minutes}m)` : ''}
                </Text>
              </View>
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
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  kpiVal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  kpiLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
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
  formHelp: {
    fontSize: 11,
    marginTop: -4,
  },
  rowInputs: {
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
  recordList: {
    gap: 8,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  recordDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  recordTime: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
