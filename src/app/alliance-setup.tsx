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

import { supabase } from "../lib/supabase";
import {
  createAllianceAndMember,
  joinAllianceAndClaimMember,
} from "../services/allianceSetup";

type Mode = "create" | "join";

export default function AllianceSetupScreen() {
  const [mode, setMode] = useState<Mode>("create");

  const [allianceName, setAllianceName] = useState("");
  const [allianceId, setAllianceId] = useState("");
  const [memberName, setMemberName] = useState("");

  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    if (!memberName.trim()) {
      Alert.alert("Missing member name", "Enter your in-game member name.");
      return;
    }

    if (mode === "create" && !allianceName.trim()) {
      Alert.alert("Missing alliance name", "Enter your alliance name.");
      return;
    }

    if (mode === "join" && !allianceId.trim()) {
      Alert.alert("Missing alliance ID", "Enter the alliance ID.");
      return;
    }
    function getErrorMessage(err: unknown) {
      if (err instanceof Error) {
        return err.message;
      }

      if (typeof err === "object" && err !== null) {
        return JSON.stringify(err, null, 2);
      }

      return String(err);
    }
    try {
      setSaving(true);

      if (mode === "create") {
        await createAllianceAndMember({
          allianceName,
          memberName,
        });
      } else {
        await joinAllianceAndClaimMember({
          allianceId,
          memberName,
        });
      }

      router.replace("/");
    } catch (err) {
      console.log("ALLIANCE SETUP ERROR:", err);

      Alert.alert("Could not finish setup", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/sign-in");
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
          <Text style={styles.title}>Set Up Your Alliance</Text>
          <Text style={styles.subtitle}>
            Create a new alliance workspace or join an existing one.
          </Text>
        </View>

        <View style={styles.modeRow}>
          <Pressable
            onPress={() => setMode("create")}
            style={[
              styles.modeButton,
              mode === "create" && styles.activeModeButton,
            ]}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === "create" && styles.activeModeButtonText,
              ]}
            >
              Create
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMode("join")}
            style={[
              styles.modeButton,
              mode === "join" && styles.activeModeButton,
            ]}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === "join" && styles.activeModeButtonText,
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
                placeholder="Example: Desert Wolves"
                autoCapitalize="words"
                style={styles.input}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Alliance ID</Text>
              <TextInput
                value={allianceId}
                onChangeText={setAllianceId}
                placeholder="Paste alliance UUID"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />

              <Text style={styles.helperText}>
                For now, joining uses the alliance UUID. We can add invite codes
                after this is working.
              </Text>
            </>
          )}

          <Text style={styles.label}>Your In-Game Name</Text>
          <TextInput
            value={memberName}
            onChangeText={setMemberName}
            placeholder="Your Last War name"
            autoCapitalize="words"
            style={styles.input}
          />

          <Pressable
            onPress={handleContinue}
            disabled={saving}
            style={[styles.primaryButton, saving && styles.disabledButton]}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === "create" ? "Create Alliance" : "Join Alliance"}
              </Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={handleSignOut} disabled={saving}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    gap: 18,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.65,
    textAlign: "center",
  },
  modeRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeModeButton: {
    backgroundColor: "#6d28d9",
  },
  modeButtonText: {
    fontWeight: "800",
    color: "#6d28d9",
  },
  activeModeButtonText: {
    color: "white",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: "#6d28d9",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  signOutText: {
    textAlign: "center",
    color: "#6d28d9",
    fontWeight: "800",
    marginTop: 4,
  },
});
