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

const themeColors = colors as typeof colors & {
  primary?: string;
  accent?: string;
};

const actionColor = themeColors.primary ?? themeColors.accent ?? "#7c3aed";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function LoginScreen() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const loadActiveAlliance = useAllianceStore(
    (state) => state.loadActiveAlliance,
  );

  const isLogin = authMode === "login";

  async function onSubmit() {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }

    if (!trimmedPassword) {
      Alert.alert("Missing Password", "Please enter your password.");
      return;
    }

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

        await loadActiveAlliance();
        router.replace("/(tabs)");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        throw error;
      }

      /*
        When email confirmation is enabled in Supabase,
        signup succeeds but no session is created yet.

        That means this is NOT an error.
      */
      if (data.user && !data.session) {
        Alert.alert(
          "Verify Your Email",
          "We created your account. Please check your email and verify your address before signing in.",
          [
            {
              text: "OK",
              onPress: () => {
                setAuthMode("login");
                setPassword("");
              },
            },
          ],
        );

        return;
      }

      /*
        This only runs if email confirmation is disabled
        and Supabase signs the user in immediately.
      */
      await loadActiveAlliance();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("AUTH ERROR:", error);

      Alert.alert(
        isLogin ? "Problem Signing In" : "Problem Creating Account",
        getErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    if (loading) {
      return;
    }

    setAuthMode(nextMode);
    setPassword("");
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>

          <Text style={styles.subtitle}>
            {isLogin
              ? "Sign in to manage your alliance."
              : "Create an account to start tracking your alliance."}
          </Text>
        </View>

        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeButton, isLogin && styles.modeButtonActive]}
            onPress={() => switchMode("login")}
            disabled={loading}
          >
            <Text
              style={[
                styles.modeButtonText,
                isLogin && styles.modeButtonTextActive,
              ]}
            >
              Login
            </Text>
          </Pressable>

          <Pressable
            style={[styles.modeButton, !isLogin && styles.modeButtonActive]}
            onPress={() => switchMode("signup")}
            disabled={loading}
          >
            <Text
              style={[
                styles.modeButtonText,
                !isLogin && styles.modeButtonTextActive,
              ]}
            >
              Sign Up
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            editable={!loading}
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={isLogin ? "password" : "new-password"}
            textContentType={isLogin ? "password" : "newPassword"}
            secureTextEntry
            editable={!loading}
            style={styles.input}
          />

          <Pressable
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.submitButtonText}>
                {isLogin ? "Sign In" : "Create Account"}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => switchMode(isLogin ? "signup" : "login")}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },

  modeRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 16,
  },

  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  modeButtonActive: {
    backgroundColor: actionColor,
  },

  modeButtonText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "700",
  },

  modeButtonTextActive: {
    color: colors.background,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },

  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },

  submitButton: {
    backgroundColor: actionColor,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginTop: 4,
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryButton: {
    alignItems: "center",
    paddingTop: 16,
  },

  secondaryButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
});
