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
import { apiClient, LeaveBalanceItem, LeaveHistoryItem } from '../../api/client';

export const TeacherLeaveScreen: React.FC = () => {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [balances, setBalances] = useState<LeaveBalanceItem[]>([]);
  const [history, setHistory] = useState<LeaveHistoryItem[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [balRes, histRes] = await Promise.all([
        apiClient.getTeacherLeaveBalances(),
        apiClient.getTeacherLeaveHistory(),
      ]);

      if (balRes.success && balRes.data?.balances) {
        setBalances(balRes.data.balances);
        if (balRes.data.balances.length > 0 && !selectedTypeId) {
          setSelectedTypeId(balRes.data.balances[0].leave_type_id);
        }
      }

      if (histRes.success && histRes.data) {
        setHistory(histRes.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedTypeId) {
      setErrorMsg('Please select a leave category.');
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg('Please enter valid start and end dates (YYYY-MM-DD).');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please state the reason for your leave.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await apiClient.applyTeacherLeave({
      leave_type_id: selectedTypeId,
      start_date: startDate.trim(),
      end_date: endDate.trim(),
      reason: reason.trim(),
    });

    if (res.success) {
      setSuccessMsg('Leave application submitted for approval.');
      setStartDate('');
      setEndDate('');
      setReason('');
      await loadData();
    } else {
      setErrorMsg(res.message || 'Could not submit leave application.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading Leave Records...
        </Text>
      </View>
    );
  }

  const selectedBalance = balances.find(b => b.leave_type_id === selectedTypeId);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Balances Carousel */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Leave Entitlements & Balances</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.balanceScroll}>
        {balances.map(b => {
          const isSelected = b.leave_type_id === selectedTypeId;
          return (
            <TouchableOpacity
              key={b.leave_type_id}
              onPress={() => setSelectedTypeId(b.leave_type_id)}
              style={[
                styles.balanceCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.codeBadge, { color: colors.primary }]}>{b.code}</Text>
                <Text style={[styles.paidBadge, { color: b.is_paid ? colors.success : colors.warning }]}>
                  {b.is_paid ? 'PAID' : 'UNPAID'}
                </Text>
              </View>
              <Text style={[styles.leaveName, { color: colors.textPrimary }]} numberOfLines={1}>
                {b.name}
              </Text>
              <View style={styles.daysRow}>
                <View>
                  <Text style={[styles.dayVal, { color: colors.textPrimary }]}>{b.remaining_days}</Text>
                  <Text style={[styles.dayLbl, { color: colors.textSecondary }]}>Remaining</Text>
                </View>
                <View>
                  <Text style={[styles.dayVal, { color: colors.textSecondary }]}>{b.used_days}</Text>
                  <Text style={[styles.dayLbl, { color: colors.textSecondary }]}>Used</Text>
                </View>
                <View>
                  <Text style={[styles.dayVal, { color: colors.textSecondary }]}>{b.entitled_days}</Text>
                  <Text style={[styles.dayLbl, { color: colors.textSecondary }]}>Total</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Application Form */}
      <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
          Apply for {selectedBalance ? selectedBalance.name : 'Leave'}
        </Text>

        {errorMsg && (
          <View style={[styles.alertBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: colors.danger }]}>
            <Text style={[styles.alertText, { color: colors.danger }]}>{errorMsg}</Text>
          </View>
        )}

        {successMsg && (
          <View style={[styles.alertBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: colors.success }]}>
            <Text style={[styles.alertText, { color: colors.success }]}>{successMsg}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Start Date (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="2026-12-01"
            placeholderTextColor={colors.textSecondary}
            value={startDate}
            onChangeText={setStartDate}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>End Date (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="2026-12-05"
            placeholderTextColor={colors.textSecondary}
            value={endDate}
            onChangeText={setEndDate}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Reason for Leave</Text>
          <TextInput
            style={[styles.textArea, { color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="State your reason or purpose of leave..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            value={reason}
            onChangeText={setReason}
          />
        </View>

        <TouchableOpacity
          onPress={handleApply}
          disabled={submitting}
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Leave Application</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Leave History */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 12 }]}>Application History</Text>
      {history.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No leave requests recorded yet.</Text>
        </View>
      ) : (
        <View style={styles.historyList}>
          {history.map(item => (
            <View
              key={item.id}
              style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.historyHeader}>
                <Text style={[styles.historyType, { color: colors.textPrimary }]}>{item.leave_type}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === 'approved'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : item.status === 'rejected'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === 'approved'
                            ? colors.success
                            : item.status === 'rejected'
                            ? colors.danger
                            : colors.warning,
                      },
                    ]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[styles.historyDates, { color: colors.textSecondary }]}>
                {item.start_date} → {item.end_date} ({item.days_requested} day{item.days_requested > 1 ? 's' : ''})
              </Text>

              {item.approval_notes && (
                <Text style={[styles.historyNotes, { color: colors.textSecondary }]}>
                  Notes: {item.approval_notes}
                </Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  balanceCard: {
    width: 140,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginRight: 10,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeBadge: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  paidBadge: {
    fontSize: 10,
    fontWeight: '700',
  },
  leaveName: {
    fontSize: 13,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dayVal: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  dayLbl: {
    fontSize: 9,
    marginTop: 1,
  },
  formCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: 'bold',
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
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 65,
    textAlignVertical: 'top',
  },
  submitBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  historyList: {
    gap: 10,
  },
  historyCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyType: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  historyDates: {
    fontSize: 12,
  },
  historyNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
