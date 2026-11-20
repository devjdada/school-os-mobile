import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { BrandingHeader } from './src/components/BrandingHeader';
import { ParentScreen } from './src/screens/ParentScreen';
import { TeacherScreen } from './src/screens/TeacherScreen';
import { StudentScreen } from './src/screens/StudentScreen';

type RoleExperience = 'parent' | 'teacher' | 'student';

export default function App() {
  const [activeRole, setActiveRole] = useState<RoleExperience>('parent');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Dynamic School Branding Header */}
      <BrandingHeader schoolName="Atlantic Hall College" campusName="Lekki Main Campus" />

      {/* Experience Switcher Bar */}
      <View style={styles.roleBar}>
        <TouchableOpacity
          onPress={() => setActiveRole('parent')}
          style={[styles.roleTab, activeRole === 'parent' && styles.roleTabActive]}
        >
          <Text style={[styles.roleText, activeRole === 'parent' && styles.roleTextActive]}>
            👨‍👩‍👧 Parent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveRole('teacher')}
          style={[styles.roleTab, activeRole === 'teacher' && styles.roleTabActive]}
        >
          <Text style={[styles.roleText, activeRole === 'teacher' && styles.roleTextActive]}>
            👩‍🏫 Teacher
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveRole('student')}
          style={[styles.roleTab, activeRole === 'student' && styles.roleTabActive]}
        >
          <Text style={[styles.roleText, activeRole === 'student' && styles.roleTextActive]}>
            🎓 Student
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Role Screen View */}
      <View style={styles.screenContainer}>
        {activeRole === 'parent' && <ParentScreen />}
        {activeRole === 'teacher' && <TeacherScreen />}
        {activeRole === 'student' && <StudentScreen />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  roleBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 6,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: '#0F172A',
  },
  roleText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#F8FAFC',
  },
  screenContainer: {
    flex: 1,
  },
});
