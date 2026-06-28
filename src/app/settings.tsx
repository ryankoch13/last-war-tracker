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
  View,
} from "react-native";

import { RequireActiveAlliance } from "../components/RequireActiveAlliance";
import { useAlliance } from "../hooks/useAlliance";
import { supabase } from "../lib/supabase";

export default function SettingsScreen() {
  return (
    <RequireActiveAlliance>
      {({ activeAllianceId }) => (
        <SettingsContent allianceId={activeAllianceId} />
      )}
    </RequireActiveAlliance>
  );
}

function SettingsContent({ allianceId }: { allianceId: string }) {
  const { alliance, loading, error, refresh, refreshing } =
    useAlliance(allianceId);

  const [signingOut, setSigningOut] = useState(false);

  async function handleCopyInviteCode() {
    if (!alliance?.invite_code) return;

    await Clipboard.setStringAsync(alliance.invite_code);
    Alert.alert("Copied", "Invite code copied to clipboard.");
  }

  async function handleShareInviteCode() {
    if (!alliance?.invite_code) return;

    await Share.share({
      message: `Join my Last War alliance tracker.\n\nAlliance: ${alliance.name}\nInvite code: ${alliance.invite_code}`,
    });
  }

  async function handleSignOut() {
    try {
      setSigningOut(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/sign-in");
    } catch (err) {
      Alert.alert(
        "Could not sign out",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.mutedText}>Loading settings...</Text>
      </View>
    );
  }

  if (error || !alliance) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Could not load settings</Text>
        <Text style={styles.errorText}>{error ?? "Alliance not found."}</Text>

        <Pressable
          onPress={refresh}
          disabled={refreshing}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {refreshing ? "Retrying..." : "Try Again"}
          </Text>
        </Pressable>
      </View>
    );
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
        <Text style={styles.allianceName}>{alliance.name}</Text>

        <View style={styles.divider} />

        <Text style={styles.cardLabel}>Invite Code</Text>

        <Pressable onPress={handleCopyInviteCode} style={styles.inviteBox}>
          <Text style={styles.inviteCode}>{alliance.invite_code}</Text>
        </Pressable>

        <Text style={styles.helperText}>
          Share this code with alliance members so they can join your tracker.
        </Text>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleCopyInviteCode}
            style={[styles.actionButton, styles.secondaryButton]}
          >
            <Text style={styles.secondaryButtonText}>Copy</Text>
          </Pressable>

          <Pressable
            onPress={handleShareInviteCode}
            style={[styles.actionButton, styles.primaryButton]}
          >
            <Text style={styles.primaryButtonText}>Share</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <Text style={styles.helperText}>
          Sign out of this device. Your alliance data will remain saved.
        </Text>

        <Pressable
          onPress={handleSignOut}
          disabled={signingOut}
          style={[styles.dangerButton, signingOut && styles.disabledButton]}
        >
          <Text style={styles.dangerButtonText}>
            {signingOut ? "Signing Out..." : "Sign Out"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.65,
  },
  mutedText: {
    fontSize: 14,
    opacity: 0.65,
  },
  errorText: {
    color: "#b91c1c",
    textAlign: "center",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "800",
    opacity: 0.65,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  allianceName: {
    fontSize: 24,
    fontWeight: "900",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 2,
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
    color: "#6d28d9",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 4,
  },
  helperText: {
    fontSize: 14,
    opacity: 0.65,
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
    backgroundColor: "#6d28d9",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "800",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#6d28d9",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#6d28d9",
    fontWeight: "800",
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#dc2626",
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.55,
  },
});
