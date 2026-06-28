import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  createAllianceAndMember,
  joinAllianceAndClaimMember,
} from "../services/allianceSetup";
import { useAllianceStore } from "../store/allianceStore";

type SetupMode = "create" | "join";

export default function AllianceSetupScreen() {
  const router = useRouter();

  const loadAlliance = useAllianceStore((state) => state.loadAlliance);

  const [mode, setMode] = useState<SetupMode>("create");
  const [allianceName, setAllianceName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [memberName, setMemberName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isCreateMode = mode === "create";

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    setErrorMessage("");

    const cleanMemberName = memberName.trim();
    const cleanAllianceName = allianceName.trim();
    const cleanInviteCode = inviteCode.trim();

    if (!cleanMemberName) {
      setErrorMessage("Enter your in-game member name.");
      return;
    }

    if (isCreateMode && !cleanAllianceName) {
      setErrorMessage("Enter an alliance name.");
      return;
    }

    if (!isCreateMode && !cleanInviteCode) {
      setErrorMessage("Enter an invite code.");
      return;
    }

    try {
      setSubmitting(true);

      const result = isCreateMode
        ? await createAllianceAndMember(cleanAllianceName, cleanMemberName)
        : await joinAllianceAndClaimMember(cleanInviteCode, cleanMemberName);

      console.log("ALLIANCE SETUP SUCCESS:", result);

      await loadAlliance(true);

      const loadedAlliance = useAllianceStore.getState().alliance;

      console.log("LOADED ALLIANCE AFTER SETUP:", loadedAlliance);

      if (!loadedAlliance) {
        throw new Error(
          "Alliance was created, but the app could not load it. Check allianceStore.ts.",
        );
      }

      router.replace("/(tabs)/members");
    } catch (error) {
      console.error("ALLIANCE SETUP ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong setting up your alliance.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode: SetupMode) => {
    setMode(nextMode);
    setErrorMessage("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Last War Tracker</Text>
          <Text style={styles.title}>Set up your alliance</Text>
          <Text style={styles.subtitle}>
            Create a new alliance workspace or join an existing one with an
            invite code.
          </Text>
        </View>

        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeButton, isCreateMode && styles.modeButtonActive]}
            onPress={() => switchMode("create")}
          >
            <Text
              style={[
                styles.modeButtonText,
                isCreateMode && styles.modeButtonTextActive,
              ]}
            >
              Create
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeButton,
              !isCreateMode && styles.modeButtonActive,
            ]}
            onPress={() => switchMode("join")}
          >
            <Text
              style={[
                styles.modeButtonText,
                !isCreateMode && styles.modeButtonTextActive,
              ]}
            >
              Join
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {isCreateMode ? (
            <View style={styles.field}>
              <Text style={styles.label}>Alliance name</Text>
              <TextInput
                value={allianceName}
                onChangeText={setAllianceName}
                placeholder="Example: Server 123 Legends"
                placeholderTextColor="#8A8A8A"
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          ) : (
            <View style={styles.field}>
              <Text style={styles.label}>Invite code</Text>
              <TextInput
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="Example: ABCD1234"
                placeholderTextColor="#8A8A8A"
                autoCapitalize="characters"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Your in-game name</Text>
            <TextInput
              value={memberName}
              onChangeText={setMemberName}
              placeholder="Example: Ryan"
              placeholderTextColor="#8A8A8A"
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Pressable
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isCreateMode ? "Create alliance" : "Join alliance"}
              </Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.footerText}>
          {isCreateMode
            ? "You will become the owner of this alliance workspace."
            : "Joining links your account to the alliance workspace."}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#111827",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    marginBottom: 28,
  },
  eyebrow: {
    color: "#A78BFA",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 16,
    lineHeight: 24,
  },
  modeRow: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#7C3AED",
  },
  modeButtonText: {
    color: "#CBD5E1",
    fontSize: 15,
    fontWeight: "700",
  },
  modeButtonTextActive: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 12,
    color: "#111827",
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 14,
  },
  submitButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  footerText: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 18,
    textAlign: "center",
  },
});
