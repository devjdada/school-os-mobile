import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth, RoleExperience } from '../../context/AuthContext';

interface Props {
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
}

export const SignInScreen: React.FC<Props> = ({
  onNavigateToSignUp,
  onNavigateToForgotPassword,
}) => {
  const { colors, spacing, typography, radii, isDark } = useTheme();
  const { login, bypassLoginForDemo, tenantSubdomain, setTenantSubdomain } = useAuth();

  const [subdomain, setSubdomain] = useState(tenantSubdomain || 'atlantichall');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email/ID and password.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    const result = await login(email.trim(), password, subdomain.trim());

    setLoading(false);
    if (!result.success) {
      setErrorMessage(result.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickDemo = (role: RoleExperience) => {
    bypassLoginForDemo(role);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Crest & Header */}
        <View style={styles.headerArea}>
          <View style={[styles.crestContainer, { backgroundColor: colors.primary }]}>
            <Text style={styles.crestText}>🎓</Text>
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>School OS</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Institutional Management & Campus Gateway
          </Text>
        </View>

        {/* Login Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Institutional Sign-In
          </Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
            Sign in with your authorized school credentials
          </Text>

          {errorMessage && (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>{errorMessage}</Text>
            </View>
          )}

          {/* School Tenant Subdomain */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Institution Subdomain</Text>
            <View style={[styles.subdomainRow, { borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}>
              <TextInput
                style={[styles.subdomainInput, { color: colors.textPrimary }]}
                value={subdomain}
                onChangeText={(val) => {
                  setSubdomain(val);
                  setTenantSubdomain(val);
                }}
                placeholder="atlantichall"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={[styles.domainSuffix, { color: colors.textMuted }]}>.schoolos.ng</Text>
            </View>
          </View>

          {/* Email / User ID */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email or Staff / Student ID</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceHighlight,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. parent@atlantichall.org"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password with Visibility Toggle */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
              <TouchableOpacity onPress={onNavigateToForgotPassword}>
                <Text style={[styles.forgotLink, { color: colors.primary }]}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.passwordRow,
                { borderColor: colors.border, backgroundColor: colors.surfaceHighlight },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: colors.textPrimary }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text style={{ fontSize: 16 }}>{showPassword ? '👁️' : '🔒'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me */}
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: rememberMe ? colors.primary : colors.border,
                  backgroundColor: rememberMe ? colors.primary : 'transparent',
                },
              ]}
            >
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.rememberText, { color: colors.textSecondary }]}>
              Keep me signed in on this mobile device
            </Text>
          </TouchableOpacity>

          {/* Sign In Primary Button */}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: colors.primary, opacity: loading ? 0.8 : 1 },
            ]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In to Campus</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Redirect Link */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an active account?{' '}
            </Text>
            <TouchableOpacity onPress={onNavigateToSignUp}>
              <Text style={[styles.signUpLink, { color: colors.primary }]}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Standalone Quick Demo Switcher */}
        <View style={styles.demoArea}>
          <Text style={[styles.demoTitle, { color: colors.textMuted }]}>
            ⚡ INSTANT SANDBOX EXPERIENCE (OFFLINE DEMO)
          </Text>
          <View style={styles.demoButtons}>
            <TouchableOpacity
              style={[styles.demoBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleQuickDemo('parent')}
            >
              <Text style={[styles.demoBtnText, { color: colors.textPrimary }]}>👨‍👩‍👧 Parent Portal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleQuickDemo('teacher')}
            >
              <Text style={[styles.demoBtnText, { color: colors.textPrimary }]}>👩‍🏫 Teacher Desk</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleQuickDemo('student')}
            >
              <Text style={[styles.demoBtnText, { color: colors.textPrimary }]}>🎓 Student Portal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  crestContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  crestText: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  subdomainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  subdomainInput: {
    flex: 1,
    height: 46,
    fontSize: 14,
    fontWeight: '600',
  },
  domainSuffix: {
    fontSize: 13,
    fontWeight: '600',
  },
  textInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    height: 46,
    fontSize: 14,
  },
  eyeBtn: {
    padding: 6,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '500',
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  footerText: {
    fontSize: 13,
  },
  signUpLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  demoArea: {
    marginTop: 32,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
