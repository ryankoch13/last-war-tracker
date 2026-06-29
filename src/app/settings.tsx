// app/settings.tsx

import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { joinAllianceByInviteCode } from "@/lib/allianceSetup";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { useActiveAlliance } from "@/hooks/useActiveAlliance";
import { AllianceRole, useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

type RouterTarget = Parameters<typeof router.replace>[0];

const LOGIN_ROUTE = "/login" as RouterTarget;
const primaryColor = "#6d28d9";

function formatRole(role: AllianceRole | null | undefined) {
  return role ? role.toUpperCase() : "R1";
}

export default function SettingsScreen() {
  return (
    <RequireActiveAlliance>
      <SettingsContent />
    </RequireActiveAlliance>
  );
}

function SettingsContent() {
  const { activeAlliance, allianceUser } = useActiveAlliance();

  const signOut = useAllianceStore((state) => state.signOut);

  const [signingOut, setSigningOut] = useState(false);
  const [copying, setCopying] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState("");
  const [joinMemberName, setJoinMemberName] = useState("");
  const [joiningAlliance, setJoiningAlliance] = useState(false);

  const loadActiveAlliance = useAllianceStore(
    (state) => state.loadActiveAlliance,
  );

  const inviteCode = activeAlliance?.inviteCode ?? "";
  const allianceName = activeAlliance?.name ?? "Your Alliance";
  const role = allianceUser?.role ?? AllianceRole.R1;

  const canManageAlliance =
    role === AllianceRole.R4 || role === AllianceRole.R5;

  async function handleCopyInviteCode() {
    if (!inviteCode) {
      Alert.alert(
        "No invite code",
        "This alliance does not have an invite code.",
      );
      return;
    }

    try {
      setCopying(true);
      await Clipboard.setStringAsync(inviteCode);
      Alert.alert("Copied", "Invite code copied to clipboard.");
    } catch (error) {
      Alert.alert(
        "Could not copy",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setCopying(false);
    }
  }

  async function handleShareInviteCode() {
    if (!inviteCode) {
      Alert.alert(
        "No invite code",
        "This alliance does not have an invite code.",
      );
      return;
    }

    try {
      setSharing(true);

      await Share.share({
        message: `Join my Last War alliance tracker.\n\nAlliance: ${allianceName}\nInvite code: ${inviteCode}`,
      });
    } catch (error) {
      Alert.alert(
        "Could not share",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSharing(false);
    }
  }

  async function onJoinAllianceFromSettings() {
    try {
      setJoiningAlliance(true);

      await joinAllianceByInviteCode(joinInviteCode, joinMemberName);

      await loadActiveAlliance();

      Alert.alert("Joined Alliance", "You joined the alliance successfully.", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (error) {
      console.error("JOIN ALLIANCE ERROR:", error);

      Alert.alert(
        "Could Not Join Alliance",
        error instanceof Error
          ? error.message
          : "Something went wrong while joining the alliance.",
      );
    } finally {
      setJoiningAlliance(false);
    }
  }

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await signOut();
      router.replace(LOGIN_ROUTE);
    } catch (error) {
      Alert.alert(
        "Could not sign out",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSigningOut(false);
    }
  }

  function confirmSignOut() {
    Alert.alert("Sign out?", "You can sign back in at any time.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: handleSignOut,
      },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Manage your alliance tracker settings.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Alliance</Text>
        <Text style={styles.allianceName}>{allianceName}</Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.cardLabel}>Your Role</Text>
            <Text style={styles.infoValue}>{formatRole(role)}</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.cardLabel}>Permissions</Text>
            <Text style={styles.infoValue}>
              {canManageAlliance ? "Manager" : "Member"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.cardLabel}>Invite Code</Text>

        <Pressable onPress={handleCopyInviteCode} style={styles.inviteBox}>
          <Text style={styles.inviteCode}>{inviteCode || "—"}</Text>
        </Pressable>

        <Text style={styles.helperText}>
          Share this code with alliance members so they can join your tracker.
        </Text>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleCopyInviteCode}
            disabled={copying}
            style={[
              styles.actionButton,
              styles.secondaryButton,
              copying && styles.disabledButton,
            ]}
          >
            <Text style={styles.secondaryButtonText}>
              {copying ? "Copying..." : "Copy"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleShareInviteCode}
            disabled={sharing}
            style={[
              styles.actionButton,
              styles.primaryButton,
              sharing && styles.disabledButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {sharing ? "Sharing..." : "Share"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <Text style={styles.helperText}>
          Sign out of this device. Your alliance data will remain saved.
        </Text>

        <Pressable
          onPress={confirmSignOut}
          disabled={signingOut}
          style={[styles.dangerButton, signingOut && styles.disabledButton]}
        >
          {signingOut ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          )}
        </Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Join Another Alliance</Text>

        <Text style={styles.description}>
          If you joined or created the wrong alliance during setup, enter an
          invite code here to join the correct one.
        </Text>

        <TextInput
          value={joinInviteCode}
          onChangeText={setJoinInviteCode}
          placeholder="Invite code"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
        />

        <TextInput
          value={joinMemberName}
          onChangeText={setJoinMemberName}
          placeholder="Your in-game name"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
          autoCorrect={false}
          style={styles.input}
        />

        <Pressable
          style={[styles.button, joiningAlliance && styles.buttonDisabled]}
          onPress={onJoinAllianceFromSettings}
          disabled={joiningAlliance}
        >
          {joiningAlliance ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.buttonText}>Join Alliance</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  cardLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  allianceName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoBlock: {
    flex: 1,
    gap: 4,
  },
  infoValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  inviteBox: {
    borderWidth: 1,
    borderColor: "#d8d0ff",
    backgroundColor: "#f8f5ff",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  inviteCode: {
    color: primaryColor,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 4,
  },
  helperText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: primaryColor,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "900",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: primaryColor,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: primaryColor,
    fontWeight: "900",
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
  },
  dangerButtonText: {
    color: "#dc2626",
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.55,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },

  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },

  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
});
