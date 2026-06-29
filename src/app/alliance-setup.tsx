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

import {
    createAllianceAndMember,
    joinAllianceByInviteCode,
} from "@/lib/allianceSetup";
import { useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

type SetupMode = "create" | "join";

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

export default function AllianceSetupScreen() {
  const [mode, setMode] = useState<SetupMode>("create");

  const [allianceName, setAllianceName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [memberName, setMemberName] = useState("");

  const [loading, setLoading] = useState(false);

  const loadActiveAlliance = useAllianceStore(
    (state) => state.loadActiveAlliance,
  );

  async function onSubmit() {
    try {
      setLoading(true);

      const trimmedMemberName = memberName.trim();

      if (!trimmedMemberName) {
        Alert.alert("Missing Name", "Please enter your in-game name.");
        return;
      }

      if (mode === "create") {
        const trimmedAllianceName = allianceName.trim();

        if (!trimmedAllianceName) {
          Alert.alert(
            "Missing Alliance Name",
            "Please enter an alliance name.",
          );
          return;
        }

        await createAllianceAndMember(trimmedAllianceName, trimmedMemberName);
      } else {
        const trimmedInviteCode = inviteCode.trim();

        if (!trimmedInviteCode) {
          Alert.alert("Missing Invite Code", "Please enter an invite code.");
          return;
        }

        await joinAllianceByInviteCode(trimmedInviteCode, trimmedMemberName);
      }

      await loadActiveAlliance();

      router.replace("/(tabs)");
    } catch (error) {
      console.error("ALLIANCE SETUP ERROR:", error);

      Alert.alert("Could Not Complete Setup", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const buttonLabel = mode === "create" ? "Create Alliance" : "Join Alliance";

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
          <Text style={styles.title}>Set Up Your Alliance</Text>
          <Text style={styles.subtitle}>
            Create a new alliance or join an existing one with an invite code.
          </Text>
        </View>

        <View style={styles.modeRow}>
          <Pressable
            style={[
              styles.modeButton,
              mode === "create" && styles.modeButtonActive,
            ]}
            onPress={() => setMode("create")}
            disabled={loading}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === "create" && styles.modeButtonTextActive,
              ]}
            >
              Create
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeButton,
              mode === "join" && styles.modeButtonActive,
            ]}
            onPress={() => setMode("join")}
            disabled={loading}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === "join" && styles.modeButtonTextActive,
              ]}
            >
              Join
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {mode === "create" ? (
            <>
              <Text style={styles.label}>Alliance Name</Text>
              <TextInput
                value={allianceName}
                onChangeText={setAllianceName}
                placeholder="Alliance name"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
                style={styles.input}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Invite Code</Text>
              <TextInput
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="Invite code"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!loading}
                style={styles.input}
              />
            </>
          )}

          <Text style={styles.label}>Your In-Game Name</Text>
          <TextInput
            value={memberName}
            onChangeText={setMemberName}
            placeholder="Your in-game name"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
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
              <Text style={styles.submitButtonText}>{buttonLabel}</Text>
            )}
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
    fontSize: 28,
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.primary,
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
});
