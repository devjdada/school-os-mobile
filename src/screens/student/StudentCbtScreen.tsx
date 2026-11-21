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
import { apiClient } from '../../api/client';

interface CbtQ {
  id: string;
  question_text: string;
  options: string[];
  points: number;
}

interface Props {
  examId?: string;
  onExit?: () => void;
}

export const StudentCbtScreen: React.FC<Props> = ({ examId = '1', onExit }) => {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [examTitle, setExamTitle] = useState('Mathematics First Term CBT Examination 2026');
  const [durationSeconds, setDurationSeconds] = useState(1800); // 30 mins
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    earned_points: number;
    total_points: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  const questions: CbtQ[] = [
    {
      id: 'q1',
      question_text: 'Solve for x in the linear algebraic equation: 3x - 7 = 14',
      options: ['x = 7', 'x = 5', 'x = 21', 'x = 3'],
      points: 5,
    },
    {
      id: 'q2',
      question_text: 'What is the sum of interior angles in any convex plane hexagon?',
      options: ['720 degrees', '540 degrees', '360 degrees', '180 degrees'],
      points: 5,
    },
    {
      id: 'q3',
      question_text: 'If a car travels 240 kilometres in 3 hours, what is its average speed?',
      options: ['80 km/h', '60 km/h', '90 km/h', '75 km/h'],
      points: 5,
    },
    {
      id: 'q4',
      question_text: 'Express 0.00045 in standard scientific notation.',
      options: ['4.5 × 10^-4', '4.5 × 10^-3', '45 × 10^-5', '0.45 × 10^-3'],
      points: 5,
    },
  ];

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || durationSeconds <= 0) return;
    const interval = setInterval(() => {
      setDurationSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, durationSeconds]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId: string, option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));
  };

  const handleSubmitExam = async () => {
    setLoading(true);
    // Instant calculation for demo/preview
    let earned = 0;
    const total = questions.length * 5;
    if (selectedAnswers['q1'] === 'x = 7') earned += 5;
    if (selectedAnswers['q2'] === '720 degrees') earned += 5;
    if (selectedAnswers['q3'] === '80 km/h') earned += 5;
    if (selectedAnswers['q4'] === '4.5 × 10^-4') earned += 5;

    const percentage = (earned / total) * 100;
    setSubmissionResult({
      earned_points: earned,
      total_points: total,
      percentage,
      passed: percentage >= 50,
    });
    setIsSubmitted(true);
    setLoading(false);
  };

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  if (isSubmitted && submissionResult) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>
            {submissionResult.passed ? '🎉' : '📚'}
          </Text>
          <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>Examination Completed</Text>
          <Text style={[styles.resultSubtitle, { color: colors.textMuted }]}>{examTitle}</Text>

          <View style={[styles.scoreCircle, { borderColor: submissionResult.passed ? colors.success : colors.danger }]}>
            <Text style={[styles.scoreBig, { color: submissionResult.passed ? colors.success : colors.danger }]}>
              {submissionResult.percentage}%
            </Text>
            <Text style={[styles.scoreSmall, { color: colors.textMuted }]}>
              {submissionResult.earned_points} / {submissionResult.total_points} Marks
            </Text>
          </View>

          <View
            style={[
              styles.verdictBadge,
              {
                backgroundColor: submissionResult.passed ? colors.successLight : colors.dangerLight,
              },
            ]}
          >
            <Text
              style={[
                styles.verdictText,
                { color: submissionResult.passed ? colors.success : colors.danger },
              ]}
            >
              {submissionResult.passed ? 'PASSED — EXCELLENT WORK' : 'NOT PASSED — REVISION NEEDED'}
            </Text>
          </View>

          {onExit && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary, width: '100%', marginTop: 24 }]}
              onPress={onExit}
            >
              <Text style={styles.primaryBtnText}>Return to Portal</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Top Bar: Title & Timer */}
      <View style={[styles.timerBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.examMeta}>
          <Text style={[styles.examHeaderTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {examTitle}
          </Text>
          <Text style={[styles.examProgress, { color: colors.textMuted }]}>
            Question {currentQuestionIndex + 1} of {questions.length} ({answeredCount} Answered)
          </Text>
        </View>

        <View style={[styles.timerBadge, { backgroundColor: durationSeconds < 300 ? colors.dangerLight : colors.primaryLight }]}>
          <Text style={[styles.timerText, { color: durationSeconds < 300 ? colors.danger : colors.primary }]}>
            ⏱ {formatTimer(durationSeconds)}
          </Text>
        </View>
      </View>

      {/* Question Selector Pills */}
      <View style={styles.pillRow}>
        {questions.map((q, idx) => {
          const isAnswered = selectedAnswers[q.id] !== undefined;
          const isCurrent = currentQuestionIndex === idx;

          return (
            <TouchableOpacity
              key={q.id}
              style={[
                styles.qPill,
                {
                  backgroundColor: isCurrent ? colors.primary : isAnswered ? colors.successLight : colors.surface,
                  borderColor: isCurrent ? colors.primary : isAnswered ? colors.success : colors.border,
                },
              ]}
              onPress={() => setCurrentQuestionIndex(idx)}
            >
              <Text
                style={[
                  styles.qPillText,
                  {
                    color: isCurrent ? '#FFFFFF' : isAnswered ? colors.success : colors.textSecondary,
                  },
                ]}
              >
                {idx + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Current Question Card */}
      <View style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.qHeader}>
          <Text style={[styles.qNumber, { color: colors.primary }]}>Question {currentQuestionIndex + 1}</Text>
          <Text style={[styles.qPoints, { color: colors.textMuted }]}>{currentQ.points} Marks</Text>
        </View>

        <Text style={[styles.qText, { color: colors.textPrimary }]}>{currentQ.question_text}</Text>

        {/* Options */}
        <View style={styles.optionsList}>
          {currentQ.options.map((option, optIdx) => {
            const isSelected = selectedAnswers[currentQ.id] === option;
            const letters = ['A', 'B', 'C', 'D'];

            return (
              <TouchableOpacity
                key={optIdx}
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.surfaceHighlight,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleSelectOption(currentQ.id, option)}
              >
                <View
                  style={[
                    styles.optBadge,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.optLetter, { color: isSelected ? '#FFFFFF' : colors.textPrimary }]}>
                    {letters[optIdx]}
                  </Text>
                </View>
                <Text style={[styles.optText, { color: colors.textPrimary }]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Navigation Buttons (Previous, Next, Submit) */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[
            styles.navBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: currentQuestionIndex === 0 ? 0.4 : 1,
            },
          ]}
          disabled={currentQuestionIndex === 0}
          onPress={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
        >
          <Text style={[styles.navBtnText, { color: colors.textPrimary }]}>← Previous</Text>
        </TouchableOpacity>

        {currentQuestionIndex < questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
          >
            <Text style={[styles.navBtnText, { color: '#FFFFFF' }]}>Next Question →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.success, borderColor: colors.success }]}
            onPress={handleSubmitExam}
          >
            <Text style={[styles.navBtnText, { color: '#FFFFFF' }]}>Submit Examination ✓</Text>
          </TouchableOpacity>
        )}
      </View>
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
  timerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  examMeta: {
    flex: 1,
    marginRight: 10,
  },
  examHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  examProgress: {
    fontSize: 11,
    marginTop: 2,
  },
  timerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '800',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  qPill: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  questionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  qNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  qPoints: {
    fontSize: 12,
  },
  qText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 20,
  },
  optionsList: {
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  optBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optLetter: {
    fontSize: 12,
    fontWeight: '700',
  },
  optText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreBig: {
    fontSize: 32,
    fontWeight: '900',
  },
  scoreSmall: {
    fontSize: 12,
    marginTop: 4,
  },
  verdictBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  verdictText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
