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

import { useActiveAlliance } from "@/hooks/useActiveAlliance";
import { useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

type SetupMode = "create" | "join";

export default function AllianceSetupScreen() {
  const [mode, setMode] = useState<SetupMode>("create");
  const [allianceName, setAllianceName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [saving, setSaving] = useState(false);

  const createAllianceAndMember = useAllianceStore(
    (state) => state.createAllianceAndMember,
  );

  const joinAllianceByInviteCode = useAllianceStore(
    (state) => state.joinAllianceByInviteCode,
  );

  const { loadActiveAlliance } = useActiveAlliance();

  const isCreateMode = mode === "create";

  function validateFields() {
    if (!memberName.trim()) {
      Alert.alert("Missing member name", "Enter your in-game member name.");
      return false;
    }

    if (isCreateMode && !allianceName.trim()) {
      Alert.alert("Missing alliance name", "Enter your alliance name.");
      return false;
    }

    if (!isCreateMode && !inviteCode.trim()) {
      Alert.alert("Missing invite code", "Enter your alliance invite code.");
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validateFields()) {
      return;
    }

    try {
      setSaving(true);

      if (isCreateMode) {
        await createAllianceAndMember(allianceName.trim(), memberName.trim());
      } else {
        await joinAllianceByInviteCode(
          inviteCode.trim().toUpperCase(),
          memberName.trim(),
        );
      }

      await loadActiveAlliance();

      const { activeAllianceId } = useAllianceStore.getState();

      if (activeAllianceId) {
        router.replace("/(tabs)/members");
        return;
      }

      Alert.alert(
        "Alliance setup incomplete",
        "Your account was updated, but the app could not load the active alliance. Try signing out and back in.",
      );
    } catch (error) {
      console.error("ALLIANCE SETUP ERROR:", error);

      Alert.alert(
        isCreateMode ? "Could not create alliance" : "Could not join alliance",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleMode() {
    setMode(isCreateMode ? "join" : "create");
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          {isCreateMode ? "Set Up Your Alliance" : "Join an Alliance"}
        </Text>

        <Text style={styles.subtitle}>
          {isCreateMode
            ? "Create your alliance board and become the R5 for this alliance."
            : "Enter an invite code from your R4 or R5 to join an existing alliance."}
        </Text>

        <TextInput
          value={memberName}
          onChangeText={setMemberName}
          placeholder="Your in-game name"
          autoCapitalize="words"
          autoCorrect={false}
          style={styles.input}
          placeholderTextColor={colors.muted}
        />

        {isCreateMode ? (
          <TextInput
            value={allianceName}
            onChangeText={setAllianceName}
            placeholder="Alliance name"
            autoCapitalize="words"
            autoCorrect={false}
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
        ) : (
          <TextInput
            value={inviteCode}
            onChangeText={(text) => setInviteCode(text.toUpperCase())}
            placeholder="Invite code"
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={saving}
          style={[styles.button, saving && styles.disabledButton]}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isCreateMode ? "Create Alliance" : "Join Alliance"}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={toggleMode} disabled={saving}>
          <Text style={styles.linkText}>
            {isCreateMode
              ? "Already have an invite code? Join an alliance"
              : "Need to create a new alliance?"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.replace("/sign-in")} disabled={saving}>
          <Text style={styles.secondaryLinkText}>Back to sign in</Text>
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
    backgroundColor: colors.background,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 8,
    color: colors.muted,
    lineHeight: 21,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
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
    color: colors.primary,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },
  secondaryLinkText: {
    color: colors.muted,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
});
