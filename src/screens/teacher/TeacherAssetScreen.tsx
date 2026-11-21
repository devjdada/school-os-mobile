import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {
  apiClient,
  TeacherAssetAssignment,
  ScannedAssetResult,
} from '../../api/client';

export const TeacherAssetScreen: React.FC = () => {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<TeacherAssetAssignment[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Scanner modal state
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanCode, setScanCode] = useState('');
  const [scannedAsset, setScannedAsset] = useState<ScannedAssetResult | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  // Return modal state
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherAssetAssignment | null>(null);
  const [returnNotes, setReturnNotes] = useState('');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.getTeacherAssets();
      if (res.success && res.data) {
        setAssignments(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load assigned assets.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (assignmentId: string) => {
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await apiClient.acknowledgeTeacherAsset(
        assignmentId,
        'Acknowledged received in good condition with accessories via mobile.'
      );
      if (res.success) {
        setSuccessMsg('Asset custody acknowledged successfully.');
        loadAssets();
      } else {
        setErrorMsg(res.message || 'Acknowledgement failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to acknowledge asset.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReturnModal = (assignment: TeacherAssetAssignment) => {
    setSelectedAssignment(assignment);
    setReturnNotes('');
    setReturnModalVisible(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedAssignment) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.requestReturnTeacherAsset(
        selectedAssignment.assignment_id,
        returnNotes || 'Staff requested handover of asset.'
      );
      if (res.success) {
        setReturnModalVisible(false);
        setSuccessMsg('Return request submitted to the asset officer.');
        loadAssets();
      } else {
        setErrorMsg(res.message || 'Request failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit return request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchCode = async () => {
    if (!scanCode.trim()) return;
    setScanLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.scanAsset(scanCode.trim());
      if (res.success && res.data) {
        setScannedAsset(res.data);
      } else {
        setScannedAsset(null);
        setErrorMsg(res.message || 'Asset not found.');
      }
    } catch (err: any) {
      setScannedAsset(null);
      setErrorMsg(err.message || 'Asset lookup failed.');
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Banner */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My School Assets</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Accountability for institution-issued laptops, lab kits, and educational hardware.
        </Text>

        <TouchableOpacity
          style={[styles.scanButton, { backgroundColor: colors.primary }]}
          onPress={() => setScannerVisible(true)}
        >
          <Text style={styles.scanButtonText}>🔍 Scan / Lookup Asset Tag</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
        </View>
      ) : null}

      {successMsg ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✅ {successMsg}</Text>
        </View>
      ) : null}

      {/* Loading */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading asset records...</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {assignments.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Assets Assigned</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                You currently do not have any school hardware or equipment assigned to your custody.
              </Text>
            </View>
          ) : (
            assignments.map((item) => (
              <View
                key={item.assignment_id}
                style={[styles.assetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>{item.asset_tag}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          item.status === 'active'
                            ? '#DEF7EC'
                            : item.status === 'pending_acknowledgement'
                            ? '#FEF08A'
                            : '#F3F4F6',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color:
                            item.status === 'active'
                              ? '#03543F'
                              : item.status === 'pending_acknowledgement'
                              ? '#854D0E'
                              : '#374151',
                        },
                      ]}
                    >
                      {item.status === 'pending_acknowledgement'
                        ? 'Pending Acceptance'
                        : item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.assetName, { color: colors.textPrimary }]}>{item.name}</Text>
                {item.brand || item.model ? (
                  <Text style={[styles.assetSpecs, { color: colors.textSecondary }]}>
                    {[item.brand, item.model].filter(Boolean).join(' • ')}
                  </Text>
                ) : null}

                {/* Accessories Checklist */}
                {item.accessories && item.accessories.length > 0 ? (
                  <View style={styles.accessoriesSection}>
                    <Text style={[styles.accessoryTitle, { color: colors.textPrimary }]}>
                      Included Accessories:
                    </Text>
                    {item.accessories.map((acc, idx) => (
                      <Text key={idx} style={[styles.accessoryItem, { color: colors.textSecondary }]}>
                        ✓ {acc}
                      </Text>
                    ))}
                  </View>
                ) : null}

                <View style={styles.metaRow}>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    Condition: <Text style={{ fontWeight: '600' }}>{item.condition}</Text>
                  </Text>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    Assigned: {item.assigned_at}
                  </Text>
                </View>

                {/* Action Buttons */}
                {item.status === 'pending_acknowledgement' ? (
                  <TouchableOpacity
                    style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleAcknowledge(item.assignment_id)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.actionBtnText}>✍️ Acknowledge Custody & Accessories</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.secondaryActionBtn, { borderColor: colors.border }]}
                    onPress={() => handleOpenReturnModal(item)}
                  >
                    <Text style={[styles.secondaryActionBtnText, { color: colors.textPrimary }]}>
                      📦 Request Return / Handover
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      )}

      {/* QR / Barcode Lookup Modal */}
      <Modal visible={scannerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Asset Tag / QR Lookup</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Enter or scan the Asset Tag (e.g. SCH-IT-2026-0001 or barcode)
            </Text>

            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="e.g. SCH-IT-2026-0001"
              placeholderTextColor={colors.textSecondary}
              value={scanCode}
              onChangeText={setScanCode}
            />

            <TouchableOpacity
              style={[styles.scanSearchBtn, { backgroundColor: colors.primary }]}
              onPress={handleSearchCode}
              disabled={scanLoading}
            >
              {scanLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.actionBtnText}>Verify Tag</Text>
              )}
            </TouchableOpacity>

            {scannedAsset ? (
              <View style={[styles.scannedCard, { backgroundColor: colors.background }]}>
                <Text style={[styles.scannedTitle, { color: colors.textPrimary }]}>{scannedAsset.name}</Text>
                <Text style={[styles.scannedMeta, { color: colors.textSecondary }]}>
                  Tag: {scannedAsset.asset_tag} • Status: {scannedAsset.status}
                </Text>
                <Text style={[styles.scannedMeta, { color: colors.textSecondary }]}>
                  Location: {scannedAsset.location}
                </Text>
                <Text style={[styles.scannedMeta, { color: colors.textSecondary }]}>
                  Custodian: {scannedAsset.custodian}
                </Text>
                <Text style={[styles.scannedMeta, { color: colors.textSecondary }]}>
                  Condition: {scannedAsset.condition}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.closeModalBtn, { borderColor: colors.border }]}
              onPress={() => {
                setScannerVisible(false);
                setScannedAsset(null);
                setScanCode('');
              }}
            >
              <Text style={[styles.closeModalText, { color: colors.textPrimary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Return Request Modal */}
      <Modal visible={returnModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Return Asset Request</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {selectedAssignment?.name} ({selectedAssignment?.asset_tag})
            </Text>

            <TextInput
              style={[styles.textArea, { borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Reason for return or remarks (e.g. Session end, transfer, maintenance)..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={returnNotes}
              onChangeText={setReturnNotes}
            />

            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
              onPress={handleConfirmReturn}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.actionBtnText}>Submit Return Handover</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeModalBtn, { borderColor: colors.border, marginTop: 10 }]}
              onPress={() => setReturnModalVisible(false)}
            >
              <Text style={[styles.closeModalText, { color: colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  scanButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  scanButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  errorBox: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#991B1B', fontSize: 13 },
  successBox: { backgroundColor: '#DEF7EC', padding: 12, borderRadius: 8, marginBottom: 16 },
  successText: { color: '#03543F', fontSize: 13 },
  centerBox: { padding: 32, alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 14 },
  listContainer: { gap: 14, paddingBottom: 32 },
  emptyCard: { padding: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  assetCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tagBadge: { backgroundColor: '#EEF2FF', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  tagBadgeText: { color: '#4338CA', fontSize: 12, fontWeight: '700' },
  statusBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  assetName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  assetSpecs: { fontSize: 13, marginBottom: 8 },
  accessoriesSection: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, marginVertical: 8 },
  accessoryTitle: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  accessoryItem: { fontSize: 12, lineHeight: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 12 },
  metaText: { fontSize: 12 },
  primaryActionBtn: { paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  secondaryActionBtn: { paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  secondaryActionBtnText: { fontWeight: '600', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, marginBottom: 14 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 10 },
  textArea: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, textAlignVertical: 'top' },
  scanSearchBtn: { paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  scannedCard: { padding: 12, borderRadius: 8, marginBottom: 12 },
  scannedTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  scannedMeta: { fontSize: 12, marginBottom: 2 },
  closeModalBtn: { paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  closeModalText: { fontWeight: '600', fontSize: 13 },
});
