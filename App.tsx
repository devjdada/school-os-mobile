import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { BrandingHeader } from './src/components/BrandingHeader';
import { SideDrawer } from './src/components/SideDrawer';
import { SignInScreen } from './src/screens/auth/SignInScreen';
import { SignUpScreen } from './src/screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { ParentScreen } from './src/screens/ParentScreen';
import { ParentInvoiceScreen } from './src/screens/parent/ParentInvoiceScreen';
import { ParentAttendanceScreen } from './src/screens/parent/ParentAttendanceScreen';
import { ParentResultsScreen } from './src/screens/parent/ParentResultsScreen';
import { TeacherScreen } from './src/screens/TeacherScreen';
import { TeacherAssessmentScreen } from './src/screens/teacher/TeacherAssessmentScreen';
import { ReportCardDesignerScreen } from './src/screens/teacher/ReportCardDesignerScreen';
import { StudentScreen } from './src/screens/StudentScreen';
import { StudentCbtScreen } from './src/screens/student/StudentCbtScreen';
import { AdminScreen } from './src/screens/AdminScreen';
import { NotificationCenterScreen } from './src/screens/NotificationCenterScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { mobileAnalytics } from './src/services/analyticsService';
import { crashlytics } from './src/services/crashlyticsService';

type AuthView = 'sign_in' | 'sign_up' | 'forgot_password';

function MainApp() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, activeRole, user } = useAuth();

  const [authView, setAuthView] = useState<AuthView>('sign_in');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeScreenId, setActiveScreenId] = useState<string>('parent_overview');
  const [activeStudentId, setActiveStudentId] = useState<string>('1');
  const [activeExamId, setActiveExamId] = useState<string>('1');

  React.useEffect(() => {
    if (activeRole === 'admin') setActiveScreenId('admin_overview');
    else if (activeRole === 'teacher') setActiveScreenId('teacher_timetable');
    else if (activeRole === 'student') setActiveScreenId('student_overview');
    else setActiveScreenId('parent_overview');
  }, [activeRole]);

  React.useEffect(() => {
    if (isAuthenticated) {
      mobileAnalytics.logScreenView(activeScreenId);
      crashlytics.logBreadcrumb(`Navigate to ${activeScreenId}`);
    }
  }, [activeScreenId, isAuthenticated]);

  // Handle Unauthenticated State: Auth Screen Stack
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        {authView === 'sign_in' && (
          <SignInScreen
            onNavigateToSignUp={() => setAuthView('sign_up')}
            onNavigateToForgotPassword={() => setAuthView('forgot_password')}
          />
        )}
        {authView === 'sign_up' && (
          <SignUpScreen onNavigateToSignIn={() => setAuthView('sign_in')} />
        )}
        {authView === 'forgot_password' && (
          <ForgotPasswordScreen onNavigateToSignIn={() => setAuthView('sign_in')} />
        )}
      </SafeAreaView>
    );
  }

  const renderActiveScreen = () => {
    switch (activeScreenId) {
      // Parent Views
      case 'parent_invoices':
        return (
          <ParentInvoiceScreen
            studentId={activeStudentId}
            onBack={() => setActiveScreenId('parent_overview')}
          />
        );
      case 'parent_attendance':
        return (
          <ParentAttendanceScreen
            studentId={activeStudentId}
            onBack={() => setActiveScreenId('parent_overview')}
          />
        );
      case 'parent_results':
        return (
          <ParentResultsScreen
            studentId={activeStudentId}
            onBack={() => setActiveScreenId('parent_overview')}
          />
        );
      case 'parent_overview':
        return (
          <ParentScreen
            onNavigate={(screenId, studentId) => {
              if (studentId) setActiveStudentId(studentId);
              setActiveScreenId(screenId);
            }}
          />
        );

      // Teacher Views
      case 'teacher_assessments':
        return <TeacherAssessmentScreen />;
      case 'teacher_report_designer':
        return <ReportCardDesignerScreen />;
      case 'teacher_timetable':
      case 'teacher_attendance':
      case 'teacher_roster':
        return <TeacherScreen />;

      // Admin Views
      case 'admin_overview':
      case 'admin_academics':
      case 'admin_finances':
      case 'admin_staff':
        return <AdminScreen />;

      // Student Views
      case 'student_cbt':
        return (
          <StudentCbtScreen
            examId={activeExamId}
            onExit={() => setActiveScreenId('student_overview')}
          />
        );
      case 'notifications':
        return (
          <NotificationCenterScreen
            onBack={() => setActiveScreenId(activeRole === 'admin' ? 'admin_overview' : activeRole === 'teacher' ? 'teacher_timetable' : activeRole === 'student' ? 'student_cbt' : 'parent_overview')}
          />
        );
      case 'student_wallet':
      case 'student_notices':
      case 'student_overview':
      default:
        if (activeRole === 'admin') return <AdminScreen />;
        if (activeRole === 'teacher') return <TeacherScreen />;
        if (activeRole === 'student') {
          return (
            <StudentScreen
              onNavigate={(screenId, examId) => {
                if (examId) setActiveExamId(examId);
                setActiveScreenId(screenId);
              }}
            />
          );
        }
        return (
          <ParentScreen
            onNavigate={(screenId, studentId) => {
              if (studentId) setActiveStudentId(studentId);
              setActiveScreenId(screenId);
            }}
          />
        );
    }
  };

  // Handle Authenticated State: Drawer-Driven Mobile Workspace (Strictly NO Bottom Navigation Bar)
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />

      {/* Dynamic Institutional Branding Header with Hamburger Menu */}
      <BrandingHeader
        schoolName={user?.tenant?.name}
        campusName={user?.tenant ? 'Campus Portal' : undefined}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {/* Main Screen View determined by active role & drawer item */}
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Left-Sliding Side Navigation Drawer */}
      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeScreenId={activeScreenId}
        onSelectScreen={(screenId) => {
          setActiveScreenId(screenId);
        }}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
