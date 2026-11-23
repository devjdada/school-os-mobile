import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SchoolProfileScreen } from './SchoolProfileScreen';
import { TeacherProfileScreen } from './TeacherProfileScreen';
import { ParentProfileScreen } from './ParentProfileScreen';
import { StudentProfileScreen } from './StudentProfileScreen';

interface Props {
  onBack?: () => void;
  initialRole?: 'admin' | 'teacher' | 'parent' | 'student';
}

export const UnifiedProfileScreen: React.FC<Props> = ({ onBack, initialRole }) => {
  const { colors, isDark } = useTheme();
  const { activeRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'parent' | 'student'>(
    initialRole || activeRole || 'parent'
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Role Switcher Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            selectedRole === 'admin' && styles.activeTabItem,
            selectedRole === 'admin' && { borderBottomColor: '#059669' },
          ]}
          onPress={() => setSelectedRole('admin')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedRole === 'admin' ? '#059669' : colors.textSecondary },
            ]}
          >
            🏫 School
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            selectedRole === 'teacher' && styles.activeTabItem,
            selectedRole === 'teacher' && { borderBottomColor: '#059669' },
          ]}
          onPress={() => setSelectedRole('teacher')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedRole === 'teacher' ? '#059669' : colors.textSecondary },
            ]}
          >
            🎓 Teacher
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            selectedRole === 'parent' && styles.activeTabItem,
            selectedRole === 'parent' && { borderBottomColor: '#2563EB' },
          ]}
          onPress={() => setSelectedRole('parent')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedRole === 'parent' ? '#2563EB' : colors.textSecondary },
            ]}
          >
            👨‍👩‍👧 Parent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            selectedRole === 'student' && styles.activeTabItem,
            selectedRole === 'student' && { borderBottomColor: '#4F46E5' },
          ]}
          onPress={() => setSelectedRole('student')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedRole === 'student' ? '#4F46E5' : colors.textSecondary },
            ]}
          >
            🎒 Student
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render Selected Profile View */}
      <View style={styles.profileContainer}>
        {selectedRole === 'admin' && <SchoolProfileScreen onBack={onBack} />}
        {selectedRole === 'teacher' && <TeacherProfileScreen onBack={onBack} />}
        {selectedRole === 'parent' && (
          <ParentProfileScreen
            onBack={onBack}
            onSelectStudent={(id) => {
              setSelectedStudentId(id);
              setSelectedRole('student');
            }}
          />
        )}
        {selectedRole === 'student' && (
          <StudentProfileScreen studentId={selectedStudentId} onBack={onBack} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  profileContainer: { flex: 1 },
});
