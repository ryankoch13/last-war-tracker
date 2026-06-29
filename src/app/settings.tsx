import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { useActiveAlliance } from "@/hooks/useActiveAlliance";
import { useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

export default function SettingsScreen() {
  const { activeAlliance, allianceUser, canManageAlliance } =
    useActiveAlliance();

  const signOut = useAllianceStore((state) => state.signOut);

  async function handleSignOut() {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not sign out.";

      Alert.alert("Sign out failed", message);
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
    <RequireActiveAlliance>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alliance</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>
              {activeAlliance?.name ?? "Unknown Alliance"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Your Role</Text>
            <Text style={styles.rowValue}>
              {allianceUser?.role ?? "member"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Invite Code</Text>
            <Text selectable style={styles.inviteCode}>
              {activeAlliance?.inviteCode || "No invite code found"}
            </Text>
          </View>

          <Text style={styles.helperText}>
            Share this invite code with alliance members so they can join this
            workspace.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Permissions</Text>

          <Text style={styles.bodyText}>
            {canManageAlliance
              ? "You can manage alliance-level features like events and train assignments."
              : "You can view alliance data. R4 and R5 members can manage alliance-level features."}
          </Text>
        </View>

        <Pressable style={styles.signOutButton} onPress={confirmSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </RequireActiveAlliance>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 2,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  row: {
    marginBottom: 14,
  },
  rowLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  rowValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  inviteCode: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
  },
  helperText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  bodyText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  signOutButton: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    marginTop: 8,
  },
  signOutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});
