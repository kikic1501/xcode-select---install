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
import { signInWithEmail } from '@/lib/api';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors, Spacing, Typography } from '@/constants';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Login failed', e.message);
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
        {/* Logo */}
        <View style={styles.hero}>
          <Text style={styles.logo}>🎉</Text>
          <Text style={styles.appName}>Recess</Text>
          <Text style={styles.tagline}>Turn "we should" into real plans.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
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
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <Button
            label="Log in"
            onPress={handleLogin}
            loading={loading}
            style={styles.btn}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign up</Text>
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
    fontSize: 64,
    marginBottom: Spacing.sm,
  },
  appName: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  tagline: {
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
