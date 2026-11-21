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
import { apiClient, ChildInvoice } from '../../api/client';

interface Props {
  studentId?: string;
  onBack?: () => void;
}

export const ParentInvoiceScreen: React.FC<Props> = ({ studentId = '1', onBack }) => {
  const { colors } = useTheme();
  const [invoices, setInvoices] = useState<ChildInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<ChildInvoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [studentId]);

  const loadInvoices = async () => {
    setLoading(true);
    const res = await apiClient.getChildInvoices(studentId);
    if (res.success && res.data && res.data.length > 0) {
      setInvoices(res.data);
      setSelectedInvoice(res.data[0]);
    } else {
      // Mock data for preview/fallback
      const mock: ChildInvoice[] = [
        {
          id: 'inv-1',
          invoice_number: 'AHC/2026/INV-0042',
          term_name: 'First Term',
          session_name: '2026/2027 Session',
          total_amount: 350000.0,
          amount_paid: 200000.0,
          balance_due: 150000.0,
          status: 'partial',
          due_date: '2026-11-30',
          items: [
            { id: 'i1', name: 'Tuition & Academic Instructional Fee', amount: 220000.0, paid_amount: 200000.0, balance: 20000.0 },
            { id: 'i2', name: 'Boarding & Dormitory Residence Levy', amount: 80000.0, paid_amount: 0.0, balance: 80000.0 },
            { id: 'i3', name: 'Digital Learning & STEM Lab Technology', amount: 35000.0, paid_amount: 0.0, balance: 35000.0 },
            { id: 'i4', name: 'College Sports & Medical Retainer', amount: 15000.0, paid_amount: 0.0, balance: 15000.0 },
          ],
        },
        {
          id: 'inv-2',
          invoice_number: 'AHC/2025/INV-0912',
          term_name: 'Third Term',
          session_name: '2025/2026 Session',
          total_amount: 320000.0,
          amount_paid: 320000.0,
          balance_due: 0.0,
          status: 'paid',
          due_date: '2026-07-15',
          items: [
            { id: 'i5', name: 'Tuition & Instructional Fee', amount: 220000.0, paid_amount: 220000.0, balance: 0.0 },
            { id: 'i6', name: 'Boarding & Hostel Retainer', amount: 100000.0, paid_amount: 100000.0, balance: 0.0 },
          ],
        },
      ];
      setInvoices(mock);
      setSelectedInvoice(mock[0]);
    }
    setLoading(false);
  };

  const active = selectedInvoice || invoices[0];

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Fee Invoices...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.topBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: colors.textPrimary }]}>School Fee Invoices</Text>
      </View>

      {/* Invoice Selector Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
        {invoices.map((inv) => (
          <TouchableOpacity
            key={inv.id}
            style={[
              styles.invPill,
              {
                backgroundColor: active?.id === inv.id ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedInvoice(inv)}
          >
            <Text
              style={[
                styles.invPillText,
                { color: active?.id === inv.id ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              {inv.term_name} ({inv.status.toUpperCase()})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {active && (
        <>
          {/* Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.invoiceHeaderRow}>
              <View>
                <Text style={[styles.invNumber, { color: colors.textPrimary }]}>{active.invoice_number}</Text>
                <Text style={[styles.invSession, { color: colors.textMuted }]}>{active.session_name} • {active.term_name}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      active.status === 'paid'
                        ? colors.successLight
                        : active.status === 'partial'
                        ? colors.warningLight
                        : colors.dangerLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        active.status === 'paid'
                          ? colors.success
                          : active.status === 'partial'
                          ? colors.warning
                          : colors.danger,
                    },
                  ]}
                >
                  {active.status === 'paid' ? 'FULLY PAID' : active.status === 'partial' ? 'PARTIALLY PAID' : 'UNPAID'}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.financialRow}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Total Bill</Text>
                <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                  ₦{active.total_amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Amount Paid</Text>
                <Text style={[styles.metricVal, { color: colors.success }]}>
                  ₦{active.amount_paid.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Outstanding</Text>
                <Text style={[styles.metricVal, { color: active.balance_due > 0 ? colors.danger : colors.textPrimary }]}>
                  ₦{active.balance_due.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {active.balance_due > 0 && (
              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: colors.primary }]}
                onPress={() => alert(`Redirecting to Paystack gateway for ₦${active.balance_due.toLocaleString('en-NG')}`)}
              >
                <Text style={styles.payBtnText}>Pay Balance ₦{active.balance_due.toLocaleString('en-NG')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Itemized Line Items */}
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Itemized Fee Breakdown</Text>
          <View style={[styles.linesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {active.items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.lineItem,
                  index < active.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                ]}
              >
                <View style={styles.lineInfo}>
                  <Text style={[styles.lineName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.lineMeta, { color: colors.textMuted }]}>
                    Paid: ₦{item.paid_amount.toLocaleString('en-NG')} • Bal: ₦{item.balance.toLocaleString('en-NG')}
                  </Text>
                </View>
                <Text style={[styles.lineAmount, { color: colors.textPrimary }]}>
                  ₦{item.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            ))}
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
  pillScroll: {
    marginBottom: 16,
  },
  invPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  invPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  invSession: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  payBtn: {
    marginTop: 16,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  linesCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  lineInfo: {
    flex: 1,
    marginRight: 12,
  },
  lineName: {
    fontSize: 14,
    fontWeight: '600',
  },
  lineMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  lineAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
});
