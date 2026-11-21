import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  schoolName?: string;
  campusName?: string;
  onOpenDrawer?: () => void;
}

export const BrandingHeader: React.FC<Props> = ({
  schoolName,
  campusName = 'Main Campus, Lekki',
  onOpenDrawer,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const displayName = schoolName || user?.tenant?.name || 'Atlantic Hall College';

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      {/* Left: Hamburger Drawer Toggle Button */}
      {onOpenDrawer && (
        <TouchableOpacity
          onPress={onOpenDrawer}
          style={[styles.hamburgerBtn, { backgroundColor: colors.surfaceHighlight }]}
          accessibilityLabel="Open Navigation Menu"
        >
          <Text style={[styles.hamburgerIcon, { color: colors.textPrimary }]}>☰</Text>
        </TouchableOpacity>
      )}

      {/* School Crest Badge */}
      <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
        <Text style={styles.logoText}>AH</Text>
      </View>

      {/* School & Campus Name */}
      <View style={styles.textContainer}>
        <Text style={[styles.schoolName, { color: colors.textPrimary }]} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={[styles.campusName, { color: colors.textMuted }]} numberOfLines={1}>
          {campusName}
        </Text>
      </View>

      {/* Right Quick Controls: Theme Toggle */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight }]}
          accessibilityLabel="Toggle Theme"
        >
          <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  hamburgerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  hamburgerIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  textContainer: {
    flex: 1,
  },
  schoolName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  campusName: {
    fontSize: 11,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
