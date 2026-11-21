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
import { useAuth } from '../../context/AuthContext';

interface Props {
  onNavigateToSignIn: () => void;
}

export const SignUpScreen: React.FC<Props> = ({ onNavigateToSignIn }) => {
  const { colors } = useTheme();
  const { register } = useAuth();

  const [accountType, setAccountType] = useState<'parent' | 'institution'>('parent');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !passwordConfirmation) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage('Password and confirmation do not match.');
      return;
    }

    if (accountType === 'institution' && (!schoolName.trim() || !subdomain.trim())) {
      setErrorMessage('Institution name and subdomain are required.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    const result = await register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      password,
      password_confirmation: passwordConfirmation,
      school_name: accountType === 'institution' ? schoolName.trim() : undefined,
      subdomain: accountType === 'institution' ? subdomain.trim() : undefined,
      role: accountType === 'institution' ? 'school-admin' : 'parent',
    });

    setLoading(false);
    if (!result.success) {
      setErrorMessage(result.message || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerArea}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join School OS to access your student, child, or school records
          </Text>
        </View>

        {/* Account Type Selector */}
        <View style={[styles.typeBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.typeTab,
              accountType === 'parent' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAccountType('parent')}
          >
            <Text
              style={[
                styles.typeTabText,
                { color: accountType === 'parent' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              👨‍👩‍👧 Parent / Guardian
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeTab,
              accountType === 'institution' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAccountType('institution')}
          >
            <Text
              style={[
                styles.typeTabText,
                { color: accountType === 'institution' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              🏫 New Institution
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {errorMessage && (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>{errorMessage}</Text>
            </View>
          )}

          {accountType === 'institution' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>School / Institution Name *</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}
                  value={schoolName}
                  onChangeText={setSchoolName}
                  placeholder="e.g. Atlantic Hall College"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Subdomain *</Text>
                <View style={[styles.subdomainRow, { borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}>
                  <TextInput
                    style={[styles.subdomainInput, { color: colors.textPrimary }]}
                    value={subdomain}
                    onChangeText={setSubdomain}
                    placeholder="atlantichall"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                  />
                  <Text style={[styles.domainSuffix, { color: colors.textMuted }]}>.schoolos.ng</Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name *</Text>
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Chief Adeleke"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address *</Text>
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. user@domain.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number (Optional)</Text>
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+234 801 234 5678"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password *</Text>
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 8 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm Password *</Text>
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              placeholder="Repeat your password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.8 : 1 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Complete Registration</Text>}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateToSignIn}>
              <Text style={[styles.signInLink, { color: colors.primary }]}>Sign In</Text>
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
    paddingTop: 44,
    paddingBottom: 40,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  typeBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
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
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
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
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
  },
  footerText: {
    fontSize: 13,
  },
  signInLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
