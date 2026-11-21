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
import { apiClient, DisciplinaryQueryItem } from '../../api/client';

export const TeacherQueryPortalScreen: React.FC = () => {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [pendingQueries, setPendingQueries] = useState<DisciplinaryQueryItem[]>([]);
  const [historyQueries, setHistoryQueries] = useState<DisciplinaryQueryItem[]>([]);
  const [explanationText, setExplanationText] = useState<{ [id: string]: string }>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    setLoading(true);
    setAlertMsg(null);
    try {
      const [pendingRes, historyRes] = await Promise.all([
        apiClient.getPendingQueries(),
        apiClient.getQueryHistory(),
      ]);

      if (pendingRes.success && pendingRes.data) {
        setPendingQueries(pendingRes.data);
      }
      if (historyRes.success && historyRes.data) {
        setHistoryQueries(historyRes.data);
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to load disciplinary records' });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (queryId: string) => {
    const text = explanationText[queryId];
    if (!text || text.trim().length < 10) {
      setAlertMsg({ type: 'error', text: 'Please provide a comprehensive explanation (at least 10 characters).' });
      return;
    }

    setSubmittingId(queryId);
    setAlertMsg(null);

    const res = await apiClient.respondToQuery(queryId, text.trim());
    if (res.success) {
      setAlertMsg({ type: 'success', text: 'Formal representation submitted to Management for review.' });
      setExplanationText(prev => {
        const next = { ...prev };
        delete next[queryId];
        return next;
      });
      await loadQueries();
    } else {
      setAlertMsg({ type: 'error', text: res.message || 'Could not submit response.' });
    }
    setSubmittingId(null);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading Confidential Query Records...
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Disciplinary & Query Portal</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          Confidential official representations and disciplinary records
        </Text>
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

      {/* Active Pending Queries Requiring Action */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Active Queries Awaiting Representation ({pendingQueries.length})
      </Text>

      {pendingQueries.length === 0 ? (
        <View style={[styles.cleanCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cleanTitle, { color: colors.success }]}>✓ Clean Record</Text>
          <Text style={[styles.cleanSub, { color: colors.textSecondary }]}>
            No outstanding queries or administrative citations pending your response.
          </Text>
        </View>
      ) : (
        <View style={styles.queryList}>
          {pendingQueries.map(q => (
            <View
              key={q.id}
              style={[styles.urgentCard, { backgroundColor: colors.surface, borderColor: colors.danger }]}
            >
              <View style={styles.urgentTop}>
                <View style={styles.refBadge}>
                  <Text style={styles.refText}>{q.query_reference}</Text>
                </View>
                <View style={styles.warningPill}>
                  <Text style={styles.warningPillText}>48-HR RESPONSE WINDOW</Text>
                </View>
              </View>

              <Text style={[styles.querySubject, { color: colors.textPrimary }]}>{q.subject}</Text>
              <Text style={[styles.queryMeta, { color: colors.textSecondary }]}>
                Incident Date: {q.incident_date} • Category: {q.incident_category} • Issued by: {q.issued_by}
              </Text>

              <View style={[styles.allegationBox, { backgroundColor: 'rgba(239, 68, 68, 0.05)' }]}>
                <Text style={[styles.allegationLabel, { color: colors.danger }]}>Official Allegation / Query:</Text>
                <Text style={[styles.allegationText, { color: colors.textPrimary }]}>{q.description}</Text>
              </View>

              {/* In-app Representation Editor */}
              <View style={styles.replySection}>
                <Text style={[styles.replyLabel, { color: colors.textSecondary }]}>
                  Your Formal Representation / Explanation:
                </Text>
                <TextInput
                  style={[styles.replyInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  placeholder="State your representation clearly and factually..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={explanationText[q.id] || ''}
                  onChangeText={val => setExplanationText(prev => ({ ...prev, [q.id]: val }))}
                />
                <TouchableOpacity
                  onPress={() => handleRespond(q.id)}
                  disabled={submittingId === q.id}
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                >
                  {submittingId === q.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Formal Representation</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Disciplinary History & Panel Outcomes */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 14 }]}>
        Disciplinary History & Case Records
      </Text>

      {historyQueries.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No past disciplinary case history on record.
          </Text>
        </View>
      ) : (
        <View style={styles.historyList}>
          {historyQueries.map(h => (
            <View
              key={h.id}
              style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.historyTop}>
                <Text style={[styles.historyRef, { color: colors.textPrimary }]}>{h.query_reference}</Text>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        h.status === 'resolved_exonerated'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : h.status === 'responded'
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color:
                          h.status === 'resolved_exonerated'
                            ? colors.success
                            : h.status === 'responded'
                            ? colors.info
                            : colors.danger,
                      },
                    ]}
                  >
                    {h.status.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[styles.hSubject, { color: colors.textPrimary }]}>{h.subject}</Text>
              <Text style={[styles.hMeta, { color: colors.textSecondary }]}>
                {h.incident_date} • {h.incident_category}
              </Text>

              {h.explanation && (
                <View style={[styles.boxRepresentation, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
                  <Text style={[styles.boxLabel, { color: colors.textSecondary }]}>Your Representation:</Text>
                  <Text style={[styles.boxText, { color: colors.textPrimary }]} numberOfLines={3}>
                    "{h.explanation}"
                  </Text>
                </View>
              )}

              {h.decision_notes && (
                <View style={[styles.boxDecision, { backgroundColor: 'rgba(16, 185, 129, 0.05)' }]}>
                  <Text style={[styles.boxLabel, { color: colors.success }]}>
                    Management Finding: {h.decided_by ? `(Decided by ${h.decided_by})` : ''}
                  </Text>
                  <Text style={[styles.boxText, { color: colors.textPrimary }]}>{h.decision_notes}</Text>
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
  header: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSub: {
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  cleanCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  cleanTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  cleanSub: {
    fontSize: 12,
  },
  queryList: {
    gap: 12,
  },
  urgentCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  urgentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  refText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 11,
  },
  warningPill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  warningPillText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 9,
  },
  querySubject: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  queryMeta: {
    fontSize: 12,
  },
  allegationBox: {
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  allegationLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  allegationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  replySection: {
    gap: 6,
    marginTop: 4,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 2,
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
  historyList: {
    gap: 10,
  },
  historyCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyRef: {
    fontSize: 13,
    fontWeight: 'bold',
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
  hSubject: {
    fontSize: 14,
    fontWeight: '600',
  },
  hMeta: {
    fontSize: 11,
  },
  boxRepresentation: {
    padding: 8,
    borderRadius: 8,
    gap: 2,
  },
  boxDecision: {
    padding: 8,
    borderRadius: 8,
    gap: 2,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  boxText: {
    fontSize: 12,
  },
});
