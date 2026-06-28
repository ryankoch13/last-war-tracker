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

type AuthMode = "sign-in" | "sign-up";

export default function SignInScreen() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const isSignUp = mode === "sign-up";

  function getCleanEmail() {
    return email.trim().toLowerCase();
  }

  function validateAuthFields() {
    if (!getCleanEmail() || !password.trim()) {
      Alert.alert("Missing info", "Enter your email and password.");
      return false;
    }

    if (isSignUp && password.length < 6) {
      Alert.alert(
        "Password too short",
        "Your password should be at least 6 characters.",
      );
      return false;
    }

    return true;
  }

  async function handleSignIn() {
    if (!validateAuthFields()) {
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: getCleanEmail(),
        password,
      });

      if (error) {
        throw error;
      }

      router.replace("/");
    } catch (err) {
      Alert.alert(
        "Could not sign in",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSignUp() {
    if (!validateAuthFields()) {
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.auth.signUp({
        email: getCleanEmail(),
        password,
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        "Account created",
        "Check your email to confirm your account, then come back and sign in.",
      );

      setMode("sign-in");
    } catch (err) {
      Alert.alert(
        "Could not create account",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleResendConfirmation() {
    const cleanEmail = getCleanEmail();

    if (!cleanEmail) {
      Alert.alert("Missing email", "Enter your email first.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        "Confirmation sent",
        "Check your email for a new confirmation link.",
      );
    } catch (err) {
      Alert.alert(
        "Could not resend confirmation",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePrimaryAction() {
    if (isSignUp) {
      await handleSignUp();
    } else {
      await handleSignIn();
    }
  }

  function toggleMode() {
    setMode(isSignUp ? "sign-in" : "sign-up");
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Last War Tracker</Text>
        <Text style={styles.subtitle}>
          {isSignUp
            ? "Create an account to start tracking alliance data."
            : "Sign in to sync your alliance data."}
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

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          placeholderTextColor={colors.muted}
        />

        <Pressable
          onPress={handlePrimaryAction}
          disabled={saving}
          style={[styles.button, saving && styles.disabledButton]}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? "Create Account" : "Sign In"}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={toggleMode} disabled={saving}>
          <Text style={styles.linkText}>
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need an account? Create one"}
          </Text>
        </Pressable>

        {isSignUp ? (
          <Pressable onPress={handleResendConfirmation} disabled={saving}>
            <Text style={styles.linkText}>Resend confirmation email</Text>
          </Pressable>
        ) : null}

        {!isSignUp ? (
          <Pressable
            onPress={() => router.push("/forgot-password")}
            disabled={saving}
          >
            <Text style={styles.linkText}>Forgot your password?</Text>
          </Pressable>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 20,
    padding: 20,
    gap: 12,
    backgroundColor: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.65,
    textAlign: "center",
    marginBottom: 8,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "white",
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
