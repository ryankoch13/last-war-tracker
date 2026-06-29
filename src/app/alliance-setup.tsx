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

import { useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

type SetupMode = "create" | "join";

export default function AllianceSetupScreen() {
  const [mode, setMode] = useState<SetupMode>("create");

  const [allianceName, setAllianceName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const loading = useAllianceStore((state) => state.loading);
  const createAllianceAndMember = useAllianceStore(
    (state) => state.createAllianceAndMember,
  );
  const joinAllianceAndClaimMember = useAllianceStore(
    (state) => state.joinAllianceAndClaimMember,
  );

  const isCreateMode = mode === "create";

  async function handleSubmit() {
    const trimmedMemberName = memberName.trim();

    if (!trimmedMemberName) {
      Alert.alert("Member name required", "Enter your in-game name.");
      return;
    }

    if (isCreateMode && !allianceName.trim()) {
      Alert.alert("Alliance name required", "Enter your alliance name.");
      return;
    }

    if (!isCreateMode && !inviteCode.trim()) {
      Alert.alert("Invite code required", "Enter your alliance invite code.");
      return;
    }

    try {
      if (isCreateMode) {
        await createAllianceAndMember(allianceName, trimmedMemberName);
      } else {
        await joinAllianceAndClaimMember(inviteCode, trimmedMemberName);
      }

      router.replace("/(tabs)");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not finish alliance setup.";

      Alert.alert("Alliance setup failed", message);
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
          <Text style={styles.title}>Set Up Your Alliance</Text>

          <Text style={styles.subtitle}>
            Create a new alliance workspace or join an existing one with an
            invite code.
          </Text>

          <View style={styles.modeRow}>
            <Pressable
              style={[
                styles.modeOption,
                isCreateMode && styles.modeOptionActive,
              ]}
              onPress={() => setMode("create")}
              disabled={loading}
            >
              <Text
                style={[
                  styles.modeOptionText,
                  isCreateMode && styles.modeOptionTextActive,
                ]}
              >
                Create
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.modeOption,
                !isCreateMode && styles.modeOptionActive,
              ]}
              onPress={() => setMode("join")}
              disabled={loading}
            >
              <Text
                style={[
                  styles.modeOptionText,
                  !isCreateMode && styles.modeOptionTextActive,
                ]}
              >
                Join
              </Text>
            </Pressable>
          </View>

          {isCreateMode ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Alliance Name</Text>
              <TextInput
                value={allianceName}
                onChangeText={setAllianceName}
                placeholder="Example: Last War Legends"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          ) : (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Invite Code</Text>
              <TextInput
                value={inviteCode}
                onChangeText={(value) => setInviteCode(value.toUpperCase())}
                placeholder="ABCDEFGH"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Your In-Game Name</Text>
            <TextInput
              value={memberName}
              onChangeText={setMemberName}
              placeholder="Your Last War name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
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
                {isCreateMode ? "Create Alliance" : "Join Alliance"}
              </Text>
            )}
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
    marginBottom: 20,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    padding: 4,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  modeOption: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  modeOptionActive: {
    backgroundColor: colors.primary,
  },
  modeOptionText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
  },
  modeOptionTextActive: {
    color: "#ffffff",
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
});
