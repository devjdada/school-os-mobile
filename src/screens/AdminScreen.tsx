import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

interface Props {
  onNavigate?: (screenId: string) => void;
}

export const AdminScreen: React.FC<Props> = ({ onNavigate }) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'finance' | 'staff'>('overview');
  const [quickNoticeSent, setQuickNoticeSent] = useState(false);
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState({
    totalStudents: '0',
    activeLearnersChange: '0.0%',
    facultyOnDuty: '0',
    facultyRate: '0.0%',
    attendanceRate: '0.0%',
    gateCheckins: '0',
    termFeesCollected: '₦0.0M',
    collectionRate: '0.0%',
    totalCollected: '₦0.0M',
    outstandingFees: '₦0.0M',
    reconciliationRate: '0.0%',
    publishedReports: '0',
    moderatedArms: '0',
  });

  const [recentEvents, setRecentEvents] = useState<{ id: string; title: string; time: string; type: string }[]>([]);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getAdminOverview();
      if (res.success && res.data) {
        if (res.data.kpis) {
          setKpis({
            totalStudents: res.data.kpis.total_students || '0',
            activeLearnersChange: res.data.kpis.active_learners_change || '0.0%',
            facultyOnDuty: res.data.kpis.faculty_on_duty || '0',
            facultyRate: res.data.kpis.faculty_rate || '0.0%',
            attendanceRate: res.data.kpis.attendance_rate || '0.0%',
            gateCheckins: res.data.kpis.gate_checkins || '0',
            termFeesCollected: res.data.kpis.term_fees_collected || '₦0.0M',
            collectionRate: res.data.kpis.collection_rate || '0.0%',
            totalCollected: res.data.kpis.total_collected || '₦0.0M',
            outstandingFees: res.data.kpis.outstanding_fees || '₦0.0M',
            reconciliationRate: res.data.kpis.reconciliation_rate || '0.0%',
            publishedReports: res.data.kpis.published_reports || '0',
            moderatedArms: res.data.kpis.moderated_arms || '0',
          });
        }
        if (res.data.recent_events) {
          setRecentEvents(res.data.recent_events);
        }
      }
    } catch {
      // Graceful error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Executive Welcome Banner */}
      <View style={[styles.welcomeBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.bannerRow}>
          <View style={styles.bannerText}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Executive Oversight</Text>
            <Text style={[styles.adminName, { color: colors.textPrimary }]}>{user?.name || 'Administrator'}</Text>
            <Text style={[styles.schoolTitle, { color: colors.primary }]}>School Principal & Administrator</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.statusBadgeText, { color: colors.primary }]}>ACTIVE TERM</Text>
          </View>
        </View>

        {/* Quick Profile Code Access */}
        <TouchableOpacity
          style={styles.profileBannerBtn}
          onPress={() => onNavigate?.('profile_school')}
        >
          <Text style={styles.profileBannerText}>🏫 View School Profile & Institution Code →</Text>
        </TouchableOpacity>

        {/* Executive Tab Filter */}
        <View style={styles.tabRow}>
          {(['overview', 'academics', 'finance', 'staff'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 3 },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === tab ? colors.primary : colors.textSecondary, fontWeight: activeTab === tab ? '700' : '500' },
                ]}
              >
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* KPI Grid */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Enrolled Students</Text>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{kpis.totalStudents}</Text>
          <Text style={styles.kpiTrend}>{kpis.activeLearnersChange}</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Daily Attendance Rate</Text>
          <Text style={[styles.kpiValue, { color: '#059669' }]}>{kpis.attendanceRate}</Text>
          <Text style={[styles.kpiSub, { color: colors.textSecondary }]}>{kpis.gateCheckins}</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Faculty On Duty</Text>
          <Text style={[styles.kpiValue, { color: colors.primary }]}>{kpis.facultyOnDuty}</Text>
          <Text style={[styles.kpiSub, { color: colors.textSecondary }]}>{kpis.facultyRate}</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Term Fees Collected</Text>
          <Text style={[styles.kpiValue, { color: '#D97706' }]}>{kpis.termFeesCollected}</Text>
          <Text style={[styles.kpiSub, { color: colors.textSecondary }]}>{kpis.collectionRate}</Text>
        </View>
      </View>

      {/* Financial Health Summary */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Financial Collections & Arrears</Text>
        <View style={styles.financeRow}>
          <View style={styles.financeItem}>
            <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>Total Collected</Text>
            <Text style={[styles.financeAmount, { color: '#059669' }]}>₦84.6M</Text>
          </View>
          <View style={styles.financeDivider} />
          <View style={styles.financeItem}>
            <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>Outstanding Arrears</Text>
            <Text style={[styles.financeAmount, { color: '#DC2626' }]}>₦18.4M</Text>
          </View>
          <View style={styles.financeDivider} />
          <View style={styles.financeItem}>
            <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>Reconciliation Rate</Text>
            <Text style={[styles.financeAmount, { color: colors.primary }]}>82.1%</Text>
          </View>
        </View>
      </View>

      {/* Academic Results Governance */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Continuous Assessment & Results Moderation</Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          All 17 class arms have completed scoring. Gold Arm has 26 verified terminal report cards.
        </Text>
        <View style={styles.academicStatusBar}>
          <View style={[styles.statusBarFill, { width: '100%', backgroundColor: '#059669' }]} />
        </View>
        <View style={styles.academicMetaRow}>
          <Text style={[styles.academicMeta, { color: colors.textSecondary }]}>Published Report Cards: 26</Text>
          <Text style={[styles.academicMeta, { color: colors.textSecondary }]}>Missing Marks: 0</Text>
          <Text style={[styles.academicMeta, { color: '#059669', fontWeight: '700' }]}>Approved & Sealed</Text>
        </View>
      </View>

      {/* Quick Executive Actions */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Administrative Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => setQuickNoticeSent(true)}
          >
            <Text style={styles.actionBtnText}>{quickNoticeSent ? '✓ Announcement Broadcasted' : '📢 Broadcast School Notice'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Activity Feed */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 40 }]}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Recent Institutional Events</Text>
        {recentEvents.map((evt) => (
          <View key={evt.id} style={[styles.eventRow, { borderBottomColor: colors.border }]}>
            <View style={styles.eventBullet} />
            <View style={styles.eventInfo}>
              <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{evt.title}</Text>
              <Text style={[styles.eventTime, { color: colors.textSecondary }]}>{evt.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeBanner: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bannerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  schoolTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    paddingTop: 12,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  tabBtnText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  kpiTrend: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 11,
    marginTop: 4,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  financeItem: {
    flex: 1,
    alignItems: 'center',
  },
  financeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  financeAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  financeDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  academicStatusBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  statusBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  academicMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  academicMeta: {
    fontSize: 12,
  },
  actionsRow: {
    marginTop: 8,
  },
  actionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  eventBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 11,
    marginTop: 2,
  },
  profileBannerBtn: {
    backgroundColor: '#05966918',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#05966950',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    alignItems: 'center',
  },
  profileBannerText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
});
