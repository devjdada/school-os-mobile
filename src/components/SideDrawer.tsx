import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth, RoleExperience } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeScreenId: string;
  onSelectScreen: (screenId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);

export const SideDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  activeScreenId,
  onSelectScreen,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, activeRole, setActiveRole, logout, tenantSubdomain } = useAuth();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  if (!isOpen && (slideAnim as any)._value === -DRAWER_WIDTH) {
    return null;
  }

  const parentMenuItems = [
    { id: 'parent_overview', label: 'Children Overview', icon: '📊' },
    { id: 'parent_invoices', label: 'Fee Invoices & Pay', icon: '💳' },
    { id: 'parent_attendance', label: 'Gate & Attendance', icon: '📅' },
    { id: 'parent_results', label: 'Terminal Reports', icon: '📝' },
    { id: 'notifications', label: 'Notifications & Alerts', icon: '🔔' },
  ];

  const teacherMenuItems = [
    { id: 'teacher_timetable', label: 'Teaching Schedule', icon: '⏱' },
    { id: 'teacher_attendance', label: 'Rapid Roll Call', icon: '📋' },
    { id: 'teacher_assessments', label: 'Continuous Assessment', icon: '🎯' },
    { id: 'teacher_roster', label: 'Class Arm Roster', icon: '👥' },
    { id: 'notifications', label: 'Notifications & Alerts', icon: '🔔' },
  ];

  const studentMenuItems = [
    { id: 'student_cbt', label: 'CBT Online Exams', icon: '🎓' },
    { id: 'student_wallet', label: 'Tuck Shop Wallet', icon: '🛍' },
    { id: 'student_notices', label: 'Noticeboard', icon: '📢' },
    { id: 'notifications', label: 'Notifications & Alerts', icon: '🔔' },
  ];

  const getMenuItems = () => {
    switch (activeRole) {
      case 'teacher':
        return teacherMenuItems;
      case 'student':
        return studentMenuItems;
      case 'parent':
      default:
        return parentMenuItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Drawer Container */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            backgroundColor: colors.surface,
            borderRightColor: colors.border,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Drawer Top Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.brandRow}>
              <View style={[styles.brandBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.brandBadgeText}>AH</Text>
              </View>
              <View style={styles.brandTextContainer}>
                <Text style={[styles.brandSchool, { color: colors.textPrimary }]}>
                  {user?.tenant?.name || 'Atlantic Hall College'}
                </Text>
                <Text style={[styles.brandCampus, { color: colors.textMuted }]}>
                  {tenantSubdomain}.schoolos.ng
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* User Profile Card */}
          <View style={[styles.userCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                {user?.name || 'Authorized User'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textMuted }]} numberOfLines={1}>
                {user?.email || 'user@schoolos.ng'}
              </Text>
              <View style={[styles.rolePill, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.rolePillText, { color: colors.primary }]}>
                  {activeRole.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Navigation Items */}
          <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              {activeRole.toUpperCase()} WORKSPACE
            </Text>

            {menuItems.map((item) => {
              const isActive = activeScreenId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    isActive && { backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => {
                    onSelectScreen(item.id);
                    onClose();
                  }}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.menuLabel,
                      {
                        color: isActive ? colors.primary : colors.textPrimary,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Role Context Switcher */}
            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: 20 }]}>
              SWITCH PORTAL CONTEXT
            </Text>
            <View style={styles.roleSwitcherRow}>
              {(['parent', 'teacher', 'student'] as RoleExperience[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleSwitchBtn,
                    {
                      borderColor: activeRole === r ? colors.primary : colors.border,
                      backgroundColor: activeRole === r ? colors.primaryLight : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setActiveRole(r);
                    onSelectScreen(
                      r === 'parent'
                        ? 'parent_overview'
                        : r === 'teacher'
                        ? 'teacher_timetable'
                        : 'student_cbt'
                    );
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.roleSwitchText,
                      { color: activeRole === r ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {r === 'parent' ? '👨‍👩‍👧 Parent' : r === 'teacher' ? '👩‍🏫 Teacher' : '🎓 Student'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* System / Preferences Section */}
            <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: 20 }]}>
              PREFERENCES
            </Text>

            {/* Dark / Light Mode Toggle */}
            <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
              <Text style={styles.menuIcon}>{isDark ? '☀️' : '🌙'}</Text>
              <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                {isDark ? 'Light Theme Mode' : 'Dark Theme Mode'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom Logout Action */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: colors.dangerLight }]}
              onPress={async () => {
                onClose();
                await logout();
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 8 }}>🚪</Text>
              <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out of Campus</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    height: '100%',
    borderRightWidth: 1,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  brandTextContainer: {
    flex: 1,
  },
  brandSchool: {
    fontSize: 14,
    fontWeight: '700',
  },
  brandCampus: {
    fontSize: 11,
  },
  closeBtn: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 11,
    marginTop: 2,
  },
  rolePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  menuScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
  },
  roleSwitcherRow: {
    flexDirection: 'column',
    gap: 6,
  },
  roleSwitchBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleSwitchText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
