import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {
  apiClient,
  TeacherPayslipItem,
  TeacherPayslipDetail,
} from '../../api/client';

export const TeacherPayslipScreen: React.FC = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [payslips, setPayslips] = useState<TeacherPayslipItem[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<TeacherPayslipDetail | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getTeacherPayslips();
      if (res.success && res.data) {
        setPayslips(res.data);
      }
    } catch {
      Alert.alert('Error', 'Unable to retrieve faculty payslip history.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (id: string) => {
    setDetailLoading(true);
    setModalVisible(true);
    try {
      const res = await apiClient.getTeacherPayslipDetail(id);
      if (res.success && res.data) {
        setSelectedPayslip(res.data);
      } else {
        Alert.alert('Error', 'Failed to load detailed payslip breakdown.');
        setModalVisible(false);
      }
    } catch {
      Alert.alert('Error', 'Network error fetching payslip itemization.');
      setModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return '₦' + Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading payslips & payroll records...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Banner */}
      <View style={[styles.headerBanner, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>Faculty Compensation & Payslips</Text>
        <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
          Nigerian statutory payroll itemizations (PITA PAYE, PRA Pension, NHF)
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {payslips.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Payslips Available</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Monthly payroll statements will appear here once audited, approved, and disbursed.
            </Text>
          </View>
        ) : (
          payslips.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.payslipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleOpenDetail(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.monthText, { color: colors.textPrimary }]}>{item.month_formatted}</Text>
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>Disbursed: {item.created_at}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.payment_status === 'paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: item.payment_status === 'paid' ? colors.success : colors.warning },
                    ]}
                  >
                    {item.payment_status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Gross Earnings</Text>
                  <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{formatCurrency(item.gross_pay)}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Deductions</Text>
                  <Text style={[styles.metricValue, { color: colors.danger }]}>{formatCurrency(item.total_deductions)}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Net Take-Home</Text>
                  <Text style={[styles.metricValueBold, { color: colors.success }]}>{formatCurrency(item.net_pay)}</Text>
                </View>
              </View>

              <Text style={[styles.tapHint, { color: colors.primary }]}>Tap to view statutory breakdown →</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Payslip Detailed Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {selectedPayslip ? selectedPayslip.month_formatted + ' Payslip' : 'Payslip Breakdown'}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {selectedPayslip?.staff_name} • {selectedPayslip?.designation}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {detailLoading || !selectedPayslip ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading breakdown...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalScroll}>
                {/* Banking & Cadre Section */}
                <View style={[styles.sectionBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                  <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Staff Grade & Banking Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Grade & Step:</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                      {selectedPayslip.grade_level} ({selectedPayslip.step})
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Bank Name:</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                      {selectedPayslip.banking.bank_name || 'Not on file'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account Number:</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                      {selectedPayslip.banking.account_number || 'Not on file'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Pension PFA / RSA:</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                      {selectedPayslip.banking.pfa_name || 'PFA'} ({selectedPayslip.banking.rsa_pin || 'N/A'})
                    </Text>
                  </View>
                </View>

                {/* Earnings */}
                <View style={[styles.sectionBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                  <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Earnings</Text>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Basic Salary:</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                      {formatCurrency(selectedPayslip.earnings.basic_salary)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Allowances (Housing, Transport, Utility):</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                      {formatCurrency(selectedPayslip.earnings.allowances)}
                    </Text>
                  </View>
                  <View style={[styles.detailRow, styles.subtotalRow]}>
                    <Text style={[styles.subtotalLabel, { color: colors.textPrimary }]}>Gross Pay:</Text>
                    <Text style={[styles.subtotalValue, { color: colors.textPrimary }]}>
                      {formatCurrency(selectedPayslip.earnings.gross_pay)}
                    </Text>
                  </View>
                </View>

                {/* Statutory Deductions */}
                <View style={[styles.sectionBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                  <Text style={[styles.sectionHeader, { color: colors.danger }]}>Statutory & Other Deductions</Text>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>PAYE Tax (PITA):</Text>
                    <Text style={[styles.detailValue, { color: colors.danger }]}>
                      {formatCurrency(selectedPayslip.deductions.paye_tax)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Employee Pension (8% PRA):</Text>
                    <Text style={[styles.detailValue, { color: colors.danger }]}>
                      {formatCurrency(selectedPayslip.deductions.pension_employee)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>National Housing Fund (2.5% NHF):</Text>
                    <Text style={[styles.detailValue, { color: colors.danger }]}>
                      {formatCurrency(selectedPayslip.deductions.nhf_deduction)}
                    </Text>
                  </View>
                  {selectedPayslip.deductions.other_deductions > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Other / Loan Deductions:</Text>
                      <Text style={[styles.detailValue, { color: colors.danger }]}>
                        {formatCurrency(selectedPayslip.deductions.other_deductions)}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.detailRow, styles.subtotalRow]}>
                    <Text style={[styles.subtotalLabel, { color: colors.danger }]}>Total Deductions:</Text>
                    <Text style={[styles.subtotalValue, { color: colors.danger }]}>
                      {formatCurrency(selectedPayslip.deductions.total_deductions)}
                    </Text>
                  </View>
                </View>

                {/* Net Pay Card */}
                <View style={[styles.netPayCard, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: colors.success }]}>
                  <Text style={[styles.netPayLabel, { color: colors.success }]}>NET TAKE-HOME PAY</Text>
                  <Text style={[styles.netPayValue, { color: colors.success }]}>
                    {formatCurrency(selectedPayslip.net_pay)}
                  </Text>
                  <Text style={[styles.netPayNote, { color: colors.textSecondary }]}>
                    Disbursed directly to {selectedPayslip.banking.bank_name || 'bank account'} on {selectedPayslip.disbursed_at || 'payroll run'}
                  </Text>
                </View>

                {/* Employer Contributory Note */}
                <View style={styles.employerNoteBox}>
                  <Text style={[styles.employerNoteText, { color: colors.textSecondary }]}>
                    * Employer Pension Contribution (10% PRA): {formatCurrency(selectedPayslip.deductions.pension_employer)} remitted directly to your PFA on your behalf.
                  </Text>
                </View>
              </ScrollView>
            )}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  bannerSubtitle: {
    fontSize: 13,
    marginTop: 4,
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
    lineHeight: 18,
  },
  payslipCard: {
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
  monthText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
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
  cardDivider: {
    height: 1,
    marginVertical: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricValueBold: {
    fontSize: 14,
    fontWeight: '800',
  },
  tapHint: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
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
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    marginTop: 14,
  },
  sectionBox: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  subtotalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)',
    paddingTop: 8,
    marginTop: 4,
  },
  subtotalLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtotalValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  netPayCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 12,
  },
  netPayLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  netPayValue: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 6,
  },
  netPayNote: {
    fontSize: 11,
    textAlign: 'center',
  },
  employerNoteBox: {
    padding: 10,
    marginBottom: 30,
  },
  employerNoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
