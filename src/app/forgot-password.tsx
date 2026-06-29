// app/forgot-password.tsx

import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "@/theme/colors";
import { supabase } from "../lib/supabase";

const RESET_REDIRECT_URL = "lastwartracker://reset-password";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSendResetEmail() {
    if (!email.trim()) {
      Alert.alert("Missing email", "Enter the email for your account.");
      return;
    }

    try {
      setSending(true);

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: RESET_REDIRECT_URL,
        },
      );

      if (error) {
        throw error;
      }

      Alert.alert("Check your email", "We sent you a password reset link.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      Alert.alert(
        "Could not send reset email",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email and we&apos;ll send you a reset link.
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={styles.input}
          placeholderTextColor={colors.muted}
        />

        <Pressable
          onPress={handleSendResetEmail}
          disabled={sending}
          style={[styles.button, sending && styles.disabledButton]}
        >
          {sending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()} disabled={sending}>
          <Text style={styles.linkText}>Back to sign in</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.65,
    textAlign: "center",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#6d28d9",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  linkText: {
    color: "#6d28d9",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },
});
