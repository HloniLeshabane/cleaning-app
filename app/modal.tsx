import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { login, register } = useAuth();
  const insets = useSafeAreaInsets();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const handleSubmit = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!isLogin && (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim())) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      setIsLoading(true);

      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        Alert.alert('Success', 'Logged in successfully!');
        router.back();
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        });
        Alert.alert('Success', 'Account created successfully!');
        router.back();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || `Failed to ${isLogin ? 'log in' : 'register'}. Please try again.`;
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const field = (
    label: string,
    placeholder: string,
    key: keyof typeof formData,
    options: { secure?: boolean; keyboard?: 'email-address' | 'phone-pad'; capitalize?: 'words' | 'none' } = {}
  ) => (
    <View style={styles.inputGroup}>
      <ThemedText style={[styles.label, { color: colors.text }]}>{label}</ThemedText>
      <TextInput
        style={[styles.input, {
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.text,
        }]}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        value={formData[key]}
        onChangeText={(text) => setFormData({ ...formData, [key]: text })}
        secureTextEntry={options.secure}
        keyboardType={options.keyboard}
        autoCapitalize={options.capitalize ?? (options.keyboard ? 'none' : 'sentences')}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.headerSection}>
            <View style={[styles.logoIcon, { backgroundColor: colors.iconBg }]}>
              <ThemedText style={styles.logoEmoji}>🧹</ThemedText>
            </View>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              {isLogin ? 'Welcome back' : 'Create account'}
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
              {isLogin ? 'Log in to continue' : 'Sign up to get started'}
            </ThemedText>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
            {!isLogin && (
              <>
                {field('First Name', 'Enter your first name', 'firstName', { capitalize: 'words' })}
                {field('Last Name', 'Enter your last name', 'lastName', { capitalize: 'words' })}
                {field('Phone Number', 'Enter your phone number', 'phone', { keyboard: 'phone-pad' })}
              </>
            )}
            {field('Email', 'Enter your email', 'email', { keyboard: 'email-address' })}
            {field('Password', 'Enter your password', 'password', { secure: true })}

            <Pressable
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary, shadowColor: colors.shadow },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.submitButtonText}>{isLogin ? 'Log In' : 'Sign Up'}</ThemedText>
              )}
            </Pressable>
          </View>

          {/* Switch Mode */}
          <Pressable style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
            <ThemedText style={[styles.switchText, { color: colors.primary }]}>
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
            </ThemedText>
          </Pressable>

          {/* Cancel */}
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <ThemedText style={[styles.cancelText, { color: colors.icon }]}>Cancel</ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
  },
  formCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    gap: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 4,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
  switchButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
  },
});
