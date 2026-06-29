import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { supabase } from "@/lib/supabase";
import { useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

type AuthMode = "login" | "signup";

export default function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const loadActiveAlliance = useAllianceStore(
    (state) => state.loadActiveAlliance,
  );

  const isLogin = mode === "login";

  async function handleSubmit() {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      Alert.alert("Email required", "Enter your email address.");
      return;
    }

    if (!trimmedPassword) {
      Alert.alert("Password required", "Enter your password.");
      return;
    }

    setLoading(true);

    try {
      setLoading(true);

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error) {
          throw error;
        }
      }

      await loadActiveAlliance();

      router.replace("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      Alert.alert(isLogin ? "Login failed" : "Sign up failed", message);

      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert(
        "Email required",
        "Enter your email address first, then tap Forgot password.",
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);

      if (error) {
        throw error;
      }

      Alert.alert(
        "Password reset sent",
        "Check your email for a password reset link.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not send password reset email.";

      Alert.alert("Password reset failed", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>

          <Text style={styles.subtitle}>
            {isLogin
              ? "Sign in to manage your alliance."
              : "Create an account to start or join an alliance."}
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              secureTextEntry
              textContentType={isLogin ? "password" : "newPassword"}
              autoComplete={isLogin ? "password" : "new-password"}
              keyboardType="default"
              style={styles.input}
            />
          </View>

          <Pressable
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isLogin ? "Log In" : "Sign Up"}
              </Text>
            )}
          </Pressable>

          {isLogin ? (
            <Pressable
              style={styles.textButton}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.textButtonText}>Forgot password?</Text>
            </Pressable>
          ) : null}

          <Pressable
            style={styles.modeButton}
            onPress={() => setMode(isLogin ? "signup" : "login")}
            disabled={loading}
          >
            <Text style={styles.modeButtonText}>
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Log in"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d8d8d8",
    backgroundColor: "#ffffff",
    color: "#111111",
    paddingHorizontal: 14,
    fontSize: 16,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  textButton: {
    alignItems: "center",
    paddingVertical: 14,
  },
  textButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  modeButton: {
    alignItems: "center",
    paddingTop: 8,
  },
  modeButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
});
