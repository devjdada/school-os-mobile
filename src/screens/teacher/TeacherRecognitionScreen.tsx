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
import {
  apiClient,
  RecognitionWallItem,
  MyBadgesSummary,
} from '../../api/client';

export const TeacherRecognitionScreen: React.FC = () => {
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<'wall' | 'badges'>('wall');
  const [loading, setLoading] = useState(true);
  const [wallItems, setWallItems] = useState<RecognitionWallItem[]>([]);
  const [myBadges, setMyBadges] = useState<MyBadgesSummary | null>(null);

  // Nomination Form State
  const [showNominate, setShowNominate] = useState(false);
  const [nomineeId, setNomineeId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [awardTitle, setAwardTitle] = useState('');
  const [citation, setCitation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setAlertMsg(null);
    try {
      const [wallRes, badgeRes] = await Promise.all([
        apiClient.getRecognitionWall(),
        apiClient.getMyBadges(),
      ]);

      if (wallRes.success && wallRes.data) {
        setWallItems(wallRes.data);
      }
      if (badgeRes.success && badgeRes.data) {
        setMyBadges(badgeRes.data);
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to load recognition records' });
    } finally {
      setLoading(false);
    }
  };

  const handleNominate = async () => {
    if (!nomineeId.trim() || !categoryId.trim() || !awardTitle.trim() || !citation.trim()) {
      setAlertMsg({ type: 'error', text: 'Please complete all nomination fields.' });
      return;
    }

    setSubmitting(true);
    setAlertMsg(null);

    const res = await apiClient.nominatePeer({
      nominee_id: nomineeId.trim(),
      award_category_id: categoryId.trim(),
      title: awardTitle.trim(),
      citation: citation.trim(),
    });

    if (res.success) {
      setAlertMsg({ type: 'success', text: 'Peer commendation nomination submitted for approval.' });
      setNomineeId('');
      setCategoryId('');
      setAwardTitle('');
      setCitation('');
      setShowNominate(false);
    } else {
      setAlertMsg({ type: 'error', text: res.message || 'Could not submit nomination.' });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading Wall of Fame...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Rewards & Recognition</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            Celebrating educator excellence & peer commendations
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowNominate(prev => !prev)}
          style={[styles.nominateBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.nominateBtnText}>{showNominate ? 'Close' : '+ Nominate'}</Text>
        </TouchableOpacity>
      </View>

      {/* Alert banner */}
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

      {/* Nomination Form Modal */}
      {showNominate && (
        <View style={[styles.nominationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Nominate a Colleague</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Colleague Staff ID / UUID</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Paste colleague staff UUID"
              placeholderTextColor={colors.textSecondary}
              value={nomineeId}
              onChangeText={setNomineeId}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Award Category UUID</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Paste award category UUID"
              placeholderTextColor={colors.textSecondary}
              value={categoryId}
              onChangeText={setCategoryId}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Commendation Title</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="e.g. Outstanding Digital Lesson delivery in Grade 8"
              placeholderTextColor={colors.textSecondary}
              value={awardTitle}
              onChangeText={setAwardTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Citation / Reason</Text>
            <TextInput
              style={[styles.textArea, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Detail their exceptional effort, student impact, or teamwork..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={citation}
              onChangeText={setCitation}
            />
          </View>

          <TouchableOpacity
            onPress={handleNominate}
            disabled={submitting}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Peer Commendation</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Selector */}
      <View style={[styles.tabRow, { backgroundColor: colors.surfaceHighlight }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('wall')}
          style={[styles.tabBtn, activeTab === 'wall' && { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'wall' ? '#FFFFFF' : colors.textSecondary }]}>
            Wall of Fame
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('badges')}
          style={[styles.tabBtn, activeTab === 'badges' && { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'badges' ? '#FFFFFF' : colors.textSecondary }]}>
            My Badges ({myBadges?.total_awards ?? 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Wall of Fame Tab */}
      {activeTab === 'wall' && (
        <View style={styles.wallList}>
          {wallItems.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No commendations published yet. Nominate a deserving colleague above!
              </Text>
            </View>
          ) : (
            wallItems.map(item => (
              <View
                key={item.id}
                style={[styles.wallCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>{item.category_name?.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.pointsText, { color: colors.warning }]}>+{item.points} pts</Text>
                </View>

                <Text style={[styles.awardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.citation, { color: colors.textSecondary }]}>"{item.citation}"</Text>

                <View style={styles.metaRow}>
                  <View>
                    <Text style={[styles.recipientName, { color: colors.textPrimary }]}>
                      {item.recipient_name}
                    </Text>
                    <Text style={[styles.recipientSub, { color: colors.textSecondary }]}>
                      {item.recipient_designation} • {item.department}
                    </Text>
                  </View>
                  {item.awarded_at && (
                    <Text style={[styles.awardDate, { color: colors.textSecondary }]}>{item.awarded_at}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* My Badges Tab */}
      {activeTab === 'badges' && (
        <View style={styles.badgesTab}>
          {/* Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.primary }]}>{myBadges?.total_awards ?? 0}</Text>
              <Text style={[styles.summaryLbl, { color: colors.textSecondary }]}>Awards Earned</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.warning }]}>{myBadges?.total_points ?? 0}</Text>
              <Text style={[styles.summaryLbl, { color: colors.textSecondary }]}>Honors Points</Text>
            </View>
          </View>

          {myBadges?.awards.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No individual badges recorded yet. Excellence and teamwork get rewarded!
              </Text>
            </View>
          ) : (
            <View style={styles.badgeList}>
              {myBadges?.awards.map(award => (
                <View
                  key={award.id}
                  style={[styles.badgeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.badgeHeader}>
                    <Text style={[styles.badgeTitle, { color: colors.textPrimary }]}>{award.title}</Text>
                    <Text style={[styles.badgePoints, { color: colors.warning }]}>+{award.points} pts</Text>
                  </View>
                  <Text style={[styles.badgeCategory, { color: colors.primary }]}>{award.category}</Text>
                  <Text style={[styles.badgeCitation, { color: colors.textSecondary }]}>"{award.citation}"</Text>
                  <Text style={[styles.badgeFooter, { color: colors.textSecondary }]}>
                    Awarded: {award.awarded_at} {award.nominator ? `• Nominated by: ${award.nominator}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}
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
    maxWidth: 240,
  },
  nominateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nominateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
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
  nominationCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: 'bold',
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
    minHeight: 55,
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
  tabRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  wallList: {
    gap: 12,
  },
  wallCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePill: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePillText: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pointsText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  awardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  citation: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
    marginTop: 4,
  },
  recipientName: {
    fontSize: 13,
    fontWeight: '600',
  },
  recipientSub: {
    fontSize: 11,
    marginTop: 1,
  },
  awardDate: {
    fontSize: 11,
  },
  badgesTab: {
    gap: 12,
  },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  summaryLbl: {
    fontSize: 11,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  badgeList: {
    gap: 10,
  },
  badgeCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  badgePoints: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeCategory: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeCitation: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  badgeFooter: {
    fontSize: 11,
    marginTop: 4,
  },
});
