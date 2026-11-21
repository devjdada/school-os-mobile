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
  TeacherCpdPortfolio,
} from '../../api/client';

export const TeacherTrainingScreen: React.FC = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [portfolio, setPortfolio] = useState<TeacherCpdPortfolio | null>(null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState<boolean>(false);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(null);
  const [selectedProgramTitle, setSelectedProgramTitle] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getTeacherTrainings();
      if (res.success && res.data) {
        setPortfolio(res.data);
      }
    } catch {
      Alert.alert('Error', 'Unable to retrieve professional development portfolio.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFeedback = (attendeeId: string, title: string) => {
    setSelectedAttendeeId(attendeeId);
    setSelectedProgramTitle(title);
    setRating(5);
    setComments('');
    setFeedbackModalVisible(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedAttendeeId) return;

    setSubmitting(true);
    try {
      const res = await apiClient.submitTrainingFeedback(selectedAttendeeId, rating, comments);
      if (res.success) {
        Alert.alert('Success', 'Thank you! Training evaluation submitted.');
        setFeedbackModalVisible(false);
        loadPortfolio();
      } else {
        Alert.alert('Error', res.message || 'Could not submit evaluation.');
      }
    } catch {
      Alert.alert('Error', 'Network error submitting evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading CPD portfolio & programs...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.headerBanner, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>Professional Development & CPD</Text>
        <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
          Continuing teacher education, workshop certifications & feedback
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* CPD Metrics Scorecard */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.metricNumber, { color: colors.primary }]}>{portfolio?.total_cpd_hours ?? 0}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>CPD Hours</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.metricNumber, { color: colors.success }]}>{portfolio?.total_trainings_attended ?? 0}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Completed</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.metricNumber, { color: '#8B5CF6' }]}>{portfolio?.certificates_earned ?? 0}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Certificates</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Assigned & Completed Programs</Text>

        {!portfolio?.programs || portfolio.programs.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Programs Enrolled</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              You have not been nominated for any training workshops yet.
            </Text>
          </View>
        ) : (
          portfolio.programs.map(item => (
            <View
              key={item.id}
              style={[styles.programCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.programHeader}>
                <View style={styles.titleCol}>
                  <Text style={[styles.programTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.providerText, { color: colors.textSecondary }]}>
                    {item.provider || 'In-House'} • {item.location_type.toUpperCase()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === 'attended'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : item.status === 'confirmed'
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
                          item.status === 'attended'
                            ? colors.success
                            : item.status === 'confirmed'
                            ? '#3B82F6'
                            : colors.warning,
                      },
                    ]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

              <View style={styles.detailsRow}>
                <View style={styles.detailCol}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Dates:</Text>
                  <Text style={[styles.detailVal, { color: colors.textPrimary }]}>
                    {item.start_date} - {item.end_date}
                  </Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>CPD Credit:</Text>
                  <Text style={[styles.detailVal, { color: colors.primary }]}>{item.cpd_hours} hrs</Text>
                </View>
              </View>

              {item.certificate_reference && (
                <View style={[styles.certBox, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                  <Text style={[styles.certLabel, { color: colors.textSecondary }]}>Certificate Ref:</Text>
                  <Text style={[styles.certCode, { color: colors.textPrimary }]}>{item.certificate_reference}</Text>
                </View>
              )}

              {item.status === 'attended' && (
                <View style={styles.actionRow}>
                  {item.feedback_rating ? (
                    <Text style={[styles.ratedText, { color: colors.success }]}>
                      ★ Rated: {item.feedback_rating} / 5
                    </Text>
                  ) : (
                    <TouchableOpacity
                      style={[styles.feedbackBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleOpenFeedback(item.id, item.title)}
                    >
                      <Text style={styles.feedbackBtnText}>Submit Workshop Feedback</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Feedback Evaluation Modal */}
      <Modal visible={feedbackModalVisible} animationType="slide" transparent onRequestClose={() => setFeedbackModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Workshop Evaluation</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>{selectedProgramTitle}</Text>
              </View>
              <TouchableOpacity onPress={() => setFeedbackModalVisible(false)}>
                <Text style={[styles.closeBtn, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Overall Effectiveness Rating</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    style={[
                      styles.starBtn,
                      { backgroundColor: rating >= star ? '#F59E0B' : colors.surfaceHighlight, borderColor: colors.border },
                    ]}
                    onPress={() => setRating(star)}
                  >
                    <Text style={[styles.starText, { color: rating >= star ? '#FFF' : colors.textSecondary }]}>
                      ★ {star}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Comments & Recommendations</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surfaceHighlight, color: colors.textPrimary, borderColor: colors.border }]}
                multiline
                numberOfLines={4}
                value={comments}
                onChangeText={setComments}
                placeholder="What was most impactful? How can the training be improved?"
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleSubmitFeedback}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Training Feedback</Text>
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
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  bannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  programCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    marginRight: 10,
  },
  programTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  providerText: {
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
    marginVertical: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  certBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 6,
  },
  certLabel: {
    fontSize: 11,
    marginRight: 6,
  },
  certCode: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  ratedText: {
    fontSize: 12,
    fontWeight: '700',
  },
  feedbackBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  feedbackBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '70%',
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
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  starBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  starText: {
    fontSize: 13,
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
  },
  submitBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
