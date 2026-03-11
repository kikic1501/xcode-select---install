import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { signUpWithEmail } from '@/lib/api';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors, Spacing, Typography } from '@/constants';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  async function handleSignup() {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password too short', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, username.trim().toLowerCase());
      Alert.alert(
        'Check your email',
        'We sent you a confirmation link. Tap it to activate your account, then log in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (e: any) {
      Alert.alert('Sign up failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.logo}>🎉</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join Recess and start making plans</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Username"
            placeholder="e.g. alex (no spaces)"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            hint="This is how friends find you"
          />
          <Input
            ref={emailRef}
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <Input
            ref={passwordRef}
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignup}
          />
          <Button
            label="Create account"
            onPress={handleSignup}
            loading={loading}
            style={styles.btn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Log in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  form: {
    gap: Spacing.md,
  },
  btn: {
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
  },
  link: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.sm,
  },
});
