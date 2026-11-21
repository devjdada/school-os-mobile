import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {
  apiClient,
  TeacherLoanItem,
  TeacherLoanScheduleData,
} from '../../api/client';

export const TeacherLoanScreen: React.FC = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [loans, setLoans] = useState<TeacherLoanItem[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<TeacherLoanScheduleData | null>(null);
  const [scheduleModalVisible, setScheduleModalVisible] = useState<boolean>(false);
  const [requestModalVisible, setRequestModalVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [loanType, setLoanType] = useState<string>('salary_advance');
  const [principalAmount, setPrincipalAmount] = useState<string>('50000');
  const [totalInstallments, setTotalInstallments] = useState<string>('3');
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getTeacherLoans();
      if (res.success && res.data) {
        setLoans(res.data);
      }
    } catch {
      Alert.alert('Error', 'Unable to retrieve faculty loan records.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSchedule = async (id: string) => {
    try {
      const res = await apiClient.getTeacherLoanSchedule(id);
      if (res.success && res.data) {
        setSelectedLoan(res.data);
        setScheduleModalVisible(true);
      }
    } catch {
      Alert.alert('Error', 'Failed to retrieve repayment schedule.');
    }
  };

  const handleApply = async () => {
    const amountNum = parseFloat(principalAmount);
    const instNum = parseInt(totalInstallments, 10);

    if (isNaN(amountNum) || amountNum < 5000) {
      Alert.alert('Validation Error', 'Minimum advance amount is ₦5,000.');
      return;
    }
    if (isNaN(instNum) || instNum < 1 || instNum > 24) {
      Alert.alert('Validation Error', 'Installments must be between 1 and 24 months.');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Validation Error', 'Please describe the purpose of this request.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.requestTeacherLoan({
        loan_type: loanType,
        principal_amount: amountNum,
        total_installments: instNum,
        reason: reason.trim(),
      });

      if (res.success) {
        Alert.alert('Success', res.message || 'Loan request submitted successfully.');
        setRequestModalVisible(false);
        setReason('');
        loadLoans();
      } else {
        Alert.alert('Failed', res.message || 'Could not submit advance request.');
      }
    } catch {
      Alert.alert('Error', 'Network error submitting loan application.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return '₦' + Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading staff loans & advances...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Banner */}
      <View style={[styles.headerBanner, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.bannerRow}>
          <View style={styles.bannerTextCol}>
            <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>Staff Loans & Advances</Text>
            <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
              Automated payroll deduction schedule & applications
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            onPress={() => setRequestModalVisible(true)}
          >
            <Text style={styles.applyBtnText}>+ Request</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loans.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Active Loans</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              You currently have no outstanding salary advances or staff cooperative loans.
            </Text>
            <TouchableOpacity
              style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
              onPress={() => setRequestModalVisible(true)}
            >
              <Text style={styles.emptyActionBtnText}>Apply for Salary Advance</Text>
            </TouchableOpacity>
          </View>
        ) : (
          loans.map(loan => (
            <TouchableOpacity
              key={loan.id}
              style={[styles.loanCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleOpenSchedule(loan.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.loanRef, { color: colors.primary }]}>{loan.loan_reference}</Text>
                  <Text style={[styles.loanType, { color: colors.textPrimary }]}>
                    {loan.loan_type.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        loan.status === 'active'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : loan.status === 'fully_paid'
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color:
                          loan.status === 'active'
                            ? colors.success
                            : loan.status === 'fully_paid'
                            ? '#3B82F6'
                            : colors.warning,
                      },
                    ]}
                  >
                    {loan.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.metricsGrid}>
                <View style={styles.gridItem}>
                  <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Principal</Text>
                  <Text style={[styles.gridValue, { color: colors.textPrimary }]}>{formatCurrency(loan.principal_amount)}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Monthly Deduction</Text>
                  <Text style={[styles.gridValue, { color: colors.danger }]}>{formatCurrency(loan.monthly_installment)}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Total Paid</Text>
                  <Text style={[styles.gridValue, { color: colors.success }]}>{formatCurrency(loan.total_paid)}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Balance Remaining</Text>
                  <Text style={[styles.gridValueBold, { color: colors.textPrimary }]}>
                    {formatCurrency(loan.outstanding_balance)}
                  </Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                  {loan.remaining_installments} of {loan.total_installments} months remaining
                </Text>
                <Text style={[styles.scheduleLink, { color: colors.primary }]}>View Repayments →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Repayment History Modal */}
      <Modal visible={scheduleModalVisible} animationType="slide" transparent onRequestClose={() => setScheduleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {selectedLoan?.loan.loan_reference} Repayment History
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Automatic payroll salary deductions
                </Text>
              </View>
              <TouchableOpacity onPress={() => setScheduleModalVisible(false)}>
                <Text style={[styles.closeBtn, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedLoan?.repayments.length === 0 ? (
                <View style={styles.noRepaymentBox}>
                  <Text style={[styles.noRepaymentText, { color: colors.textSecondary }]}>
                    No deductions processed yet. Deductions start in the upcoming payroll cycle.
                  </Text>
                </View>
              ) : (
                selectedLoan?.repayments.map(r => (
                  <View key={r.id} style={[styles.repaymentRow, { borderBottomColor: colors.border }]}>
                    <View>
                      <Text style={[styles.repaymentMonth, { color: colors.textPrimary }]}>{r.repayment_month}</Text>
                      <Text style={[styles.repaymentDate, { color: colors.textSecondary }]}>{r.processed_at}</Text>
                    </View>
                    <View style={styles.repaymentRight}>
                      <Text style={[styles.repaymentAmount, { color: colors.success }]}>-{formatCurrency(r.amount)}</Text>
                      <Text style={[styles.repaymentBalance, { color: colors.textSecondary }]}>
                        Bal: {formatCurrency(r.balance_after)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Application Request Modal */}
      <Modal visible={requestModalVisible} animationType="slide" transparent onRequestClose={() => setRequestModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Request Salary Advance</Text>
              <TouchableOpacity onPress={() => setRequestModalVisible(false)}>
                <Text style={[styles.closeBtn, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Loan Type</Text>
              <View style={styles.typeSelector}>
                {['salary_advance', 'emergency_loan', 'cooperative_loan'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: loanType === t ? colors.primary : colors.surfaceHighlight,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setLoanType(t)}
                  >
                    <Text style={[styles.typeChipText, { color: loanType === t ? '#FFF' : colors.textPrimary }]}>
                      {t.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Amount (NGN)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.textPrimary, borderColor: colors.border }]}
                keyboardType="numeric"
                value={principalAmount}
                onChangeText={setPrincipalAmount}
                placeholder="50000"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Repayment Duration (Months)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.textPrimary, borderColor: colors.border }]}
                keyboardType="numeric"
                value={totalInstallments}
                onChangeText={setTotalInstallments}
                placeholder="3"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Purpose / Reason</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surfaceHighlight, color: colors.textPrimary, borderColor: colors.border }]}
                multiline
                numberOfLines={3}
                value={reason}
                onChangeText={setReason}
                placeholder="Brief justification for salary advance..."
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleApply}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Advance Application</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerBanner: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  bannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  applyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyActionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loanCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  loanRef: {
    fontSize: 12,
    fontWeight: '700',
  },
  loanType: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  gridItem: {
    width: '50%',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  gridValueBold: {
    fontSize: 14,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 11,
  },
  scheduleLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 4,
  },
  modalScroll: {
    marginTop: 14,
  },
  noRepaymentBox: {
    padding: 24,
    alignItems: 'center',
  },
  noRepaymentText: {
    fontSize: 13,
    textAlign: 'center',
  },
  repaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  repaymentMonth: {
    fontSize: 14,
    fontWeight: '600',
  },
  repaymentDate: {
    fontSize: 11,
    marginTop: 2,
  },
  repaymentRight: {
    alignItems: 'flex-end',
  },
  repaymentAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  repaymentBalance: {
    fontSize: 11,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 70,
  },
  submitBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
