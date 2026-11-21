import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Switch,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { apiClient, AppNotificationItem } from '../api/client';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'fees', label: 'Fees' },
  { key: 'academics', label: 'Academics' },
  { key: 'hr', label: 'HR' },
  { key: 'assets', label: 'Assets' },
  { key: 'emergency', label: 'Alerts' },
];

interface NotificationCenterScreenProps {
  onBack?: () => void;
}

export const NotificationCenterScreen: React.FC<NotificationCenterScreenProps> = ({ onBack }) => {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Preferences modal state
  const [prefModalVisible, setPrefModalVisible] = useState(false);
  const [categoriesPref, setCategoriesPref] = useState<Record<string, boolean>>({
    attendance: true,
    fees: true,
    academics: true,
    hr: true,
    assets: true,
    emergency: true,
  });

  useEffect(() => {
    loadNotifications();
  }, [selectedCategory, unreadOnly]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getInAppNotifications(
        selectedCategory || undefined,
        unreadOnly ? 'unread' : undefined
      );
      if (res.success && res.data) {
        setNotifications(res.data);
      }
      const countRes = await apiClient.getInAppUnreadCount();
      if (countRes.success && typeof countRes.data?.unread_count === 'number') {
        setUnreadCount(countRes.data.unread_count);
      }
    } catch (err) {
      console.warn('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.markInAppNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Mark read failed', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllInAppNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.warn('Mark all read failed', err);
    }
  };

  const handleOpenPreferences = async () => {
    try {
      const res = await apiClient.getInAppNotificationPreferences();
      if (res.success && res.data?.categories) {
        setCategoriesPref(res.data.categories);
      }
    } catch (err) {
      console.warn('Get preferences failed', err);
    }
    setPrefModalVisible(true);
  };

  const handleSavePreferences = async () => {
    try {
      await apiClient.updateInAppNotificationPreferences({
        categories: categoriesPref,
      });
      setPrefModalVisible(false);
    } catch (err) {
      console.warn('Save preferences failed', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header bar */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {onBack && (
              <TouchableOpacity
                onPress={onBack}
                style={{
                  marginRight: 10,
                  padding: 6,
                  borderRadius: 8,
                  backgroundColor: colors.surfaceHighlight,
                }}
              >
                <Text style={{ fontSize: 16, color: colors.textPrimary }}>←</Text>
              </TouchableOpacity>
            )}
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {unreadCount > 0 ? `${unreadCount} unread notices` : 'All caught up'}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: colors.primaryLight }]}
                onPress={handleMarkAllRead}
              >
                <Text style={[styles.smallBtnText, { color: colors.primary }]}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.smallBtn, { borderColor: colors.border, borderWidth: 1 }]}
              onPress={handleOpenPreferences}
            >
              <Text style={[styles.smallBtnText, { color: colors.textPrimary }]}>⚙️ Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category horizontal pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceHighlight,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications list */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading notices...</Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {notifications.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Notifications</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                You have no notifications in this category.
              </Text>
            </View>
          ) : (
            notifications.map((item) => {
              const isUnread = !item.read_at;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isUnread ? colors.primary : colors.border,
                      borderLeftWidth: isUnread ? 4 : 1,
                    },
                  ]}
                  onPress={() => isUnread && handleMarkAsRead(item.id)}
                >
                  <View style={styles.notifHeader}>
                    <View
                      style={[
                        styles.catBadge,
                        {
                          backgroundColor:
                            item.priority === 'urgent'
                              ? '#FEE2E2'
                              : colors.surfaceHighlight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.catBadgeText,
                          {
                            color:
                              item.priority === 'urgent'
                                ? '#991B1B'
                                : colors.textSecondary,
                          },
                        ]}
                      >
                        {item.category.toUpperCase()}
                      </Text>
                    </View>
                    {isUnread && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.notifBody, { color: colors.textSecondary }]}>
                    {item.body}
                  </Text>

                  <View style={styles.notifFooter}>
                    <Text style={[styles.dateText, { color: colors.textMuted }]}>
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {isUnread && (
                      <TouchableOpacity onPress={() => handleMarkAsRead(item.id)}>
                        <Text style={[styles.markReadText, { color: colors.primary }]}>
                          Mark read
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Preferences Modal */}
      <Modal visible={prefModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Notification Preferences
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Choose which notifications you wish to receive.
            </Text>

            {['attendance', 'fees', 'academics', 'hr', 'assets'].map((cat) => (
              <View key={cat} style={styles.prefRow}>
                <Text style={[styles.prefLabel, { color: colors.textPrimary }]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} Alerts
                </Text>
                <Switch
                  value={categoriesPref[cat] ?? true}
                  onValueChange={(val) =>
                    setCategoriesPref((prev) => ({ ...prev, [cat]: val }))
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSavePreferences}
            >
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeBtn, { borderColor: colors.border }]}
              onPress={() => setPrefModalVisible(false)}
            >
              <Text style={[styles.closeBtnText, { color: colors.textPrimary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  smallBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  smallBtnText: { fontSize: 12, fontWeight: '600' },
  pillScroll: { marginTop: 12 },
  pill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  pillText: { fontSize: 12, fontWeight: '600' },
  centerBox: { padding: 32, alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 14 },
  listContainer: { flex: 1 },
  emptyCard: { padding: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySubtitle: { fontSize: 13, textAlign: 'center' },
  notifCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6 },
  catBadgeText: { fontSize: 10, fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  notifTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  notifBody: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  notifFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 11 },
  markReadText: { fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, marginBottom: 16 },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  prefLabel: { fontSize: 14, fontWeight: '600' },
  saveBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  closeBtn: { paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center', marginTop: 8 },
  closeBtnText: { fontWeight: '600', fontSize: 13 },
});
