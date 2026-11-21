import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { apiClient, ChildProfile } from '../api/client';

interface Props {
  onNavigate?: (screenId: string, studentId?: string) => void;
}

export const ParentScreen: React.FC<Props> = ({ onNavigate }) => {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    setLoading(true);
    const res = await apiClient.getParentChildren();
    if (res.success && res.data) {
      setChildren(res.data);
    } else {
      // Mock fallback for standalone mobile preview
      setChildren([
        {
          id: '1',
          full_name: 'Chidi Emeka Okonkwo',
          admission_number: 'AHC/2026/0001',
          class_name: 'JSS 1 Gold',
          gender: 'male',
          gate_status: {
            direction: 'in',
            tapped_at: '07:48 AM',
            terminal: 'East Perimeter Gate Turnstile 01',
          },
          fee_balance: 0.0,
          wallet_balance: 12500.0,
        },
        {
          id: '2',
          full_name: 'Amina Zainab Danjuma',
          admission_number: 'AHC/2026/0002',
          class_name: 'SSS 1 Science A',
          gender: 'female',
          gate_status: {
            direction: 'in',
            tapped_at: '07:54 AM',
            terminal: 'Main Gate Turnstile 02',
          },
          fee_balance: 45000.0,
          wallet_balance: 8500.0,
        },
      ]);
    }
    setLoading(false);
  };

  const activeChild = children[selectedChildIndex] || children[0];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Syncing Guardian Records...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Child Switcher Pills */}
      <View style={styles.switcherContainer}>
        {children.map((child, idx) => (
          <TouchableOpacity
            key={child.id}
            onPress={() => setSelectedChildIndex(idx)}
            style={[
              styles.childPill,
              selectedChildIndex === idx && styles.childPillActive,
            ]}
          >
            <Text
              style={[
                styles.childPillText,
                selectedChildIndex === idx && styles.childPillTextActive,
              ]}
            >
              {child.full_name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeChild && (
        <View style={styles.cardContainer}>
          {/* Child Identity Card */}
          <View style={styles.childHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{activeChild.full_name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.childName}>{activeChild.full_name}</Text>
              <Text style={styles.childClass}>
                {activeChild.class_name} • {activeChild.admission_number}
              </Text>
            </View>
          </View>

          {/* Real-time Turnstile Gate Tap Banner */}
          <TouchableOpacity
            style={styles.gateAlertCard}
            onPress={() => onNavigate && onNavigate('parent_attendance', activeChild.id)}
            activeOpacity={0.8}
          >
            <View style={styles.gateHeader}>
              <Text style={styles.gateTitle}>Perimeter Gate Security Status</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live IoT</Text>
              </View>
            </View>

            {activeChild.gate_status ? (
              <View style={styles.gateInfo}>
                <Text style={styles.gateStatusSuccess}>
                  ✓ Safely On Campus (Arrived {activeChild.gate_status.tapped_at})
                </Text>
                <Text style={styles.gateTerminal}>
                  Sensor: {activeChild.gate_status.terminal} →
                </Text>
              </View>
            ) : (
              <Text style={styles.gateStatusNeutral}>
                No gate turnstile activity logged today. Tap for 30-day log →
              </Text>
            )}
          </TouchableOpacity>

          {/* Academic Report Card Quick Access */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => onNavigate && onNavigate('parent_results', activeChild.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.metricTitle}>Terminal Academic Report Card</Text>
            <Text style={[styles.metricValue, { color: '#38BDF8' }]}>
              First Term Examination Transcript →
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>
              View continuous assessment breakdown, teacher remarks & class position
            </Text>
          </TouchableOpacity>

          {/* Canteen Wallet Card */}
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Tuck Shop RFID Prepaid Wallet</Text>
            <Text style={styles.metricValue}>
              ₦{activeChild.wallet_balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </Text>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>+ Top Up via Paystack</Text>
            </TouchableOpacity>
          </View>

          {/* Tuition Fee Card */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => onNavigate && onNavigate('parent_invoices', activeChild.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.metricTitle}>Tuition & Term Fee Balance</Text>
            <Text
              style={[
                styles.metricValue,
                activeChild.fee_balance > 0 ? styles.textDanger : styles.textSuccess,
              ]}
            >
              {activeChild.fee_balance > 0
                ? `₦${activeChild.fee_balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })} Outstanding`
                : '✓ Fully Cleared'}
            </Text>
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => onNavigate && onNavigate('parent_invoices', activeChild.id)}
            >
              <Text style={styles.payBtnText}>View Itemized Breakdown & Pay →</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
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
    gap: 16,
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
  switcherContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  childPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  childPillActive: {
    backgroundColor: '#059669',
  },
  childPillText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  childPillTextActive: {
    color: '#FFFFFF',
  },
  cardContainer: {
    gap: 16,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  childName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  childClass: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  gateAlertCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  gateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gateTitle: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  gateInfo: {
    gap: 4,
  },
  gateStatusSuccess: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gateTerminal: {
    color: '#64748B',
    fontSize: 12,
  },
  gateStatusNeutral: {
    color: '#94A3B8',
    fontSize: 13,
  },
  metricCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  metricTitle: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metricValue: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  textSuccess: {
    color: '#10B981',
  },
  textDanger: {
    color: '#F43F5E',
  },
  actionBtn: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  payBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
