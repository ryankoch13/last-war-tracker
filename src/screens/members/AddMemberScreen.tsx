import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { useActiveAllianceId } from "@/hooks/useActiveAlliance";
import { supabase } from "@/lib/supabase";
import { AllianceRole } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

const MEMBER_ROLES = [
  AllianceRole.R1,
  AllianceRole.R2,
  AllianceRole.R3,
  AllianceRole.R4,
  AllianceRole.R5,
];

function parseNumber(value: string) {
  const cleanedValue = value.replace(/,/g, "").trim();

  if (!cleanedValue) {
    return 0;
  }

  const parsedValue = Number(cleanedValue);

  if (Number.isNaN(parsedValue)) {
    return 0;
  }

  return Math.max(0, Math.round(parsedValue));
}

function formatRole(role: AllianceRole) {
  return String(role).toUpperCase();
}

function normalizeRoleForDatabase(role: AllianceRole) {
  return String(role).toLowerCase();
}

function isLeaderRole(role: string | null | undefined) {
  const normalizedRole = String(role ?? "").toLowerCase();

  return normalizedRole === "r4" || normalizedRole === "r5";
}

export function AddMemberScreen() {
  const activeAllianceId = useActiveAllianceId();

  const [name, setName] = useState("");
  const [role, setRole] = useState<AllianceRole>(AllianceRole.R1);
  const [power, setPower] = useState("");
  const [level, setLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmedName = name.trim();

    if (!activeAllianceId) {
      Alert.alert(
        "No alliance selected",
        "You need to be in an active alliance before adding members.",
      );
      return;
    }

    if (!trimmedName) {
      Alert.alert("Name required", "Enter the member's in-game name.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("You need to be logged in to add members.");
      }

      const { data: activeAllianceUser, error: activeAllianceUserError } =
        await supabase
          .from("alliance_users")
          .select("role")
          .eq("alliance_id", activeAllianceId)
          .eq("user_id", user.id)
          .maybeSingle();

      if (activeAllianceUserError) {
        throw activeAllianceUserError;
      }

      if (!isLeaderRole(activeAllianceUser?.role)) {
        throw new Error("Only R4 and R5 members can add roster members.");
      }

      const { error: insertError } = await supabase.from("members").insert({
        alliance_id: activeAllianceId,
        user_id: null,
        created_by: user.id,
        name: trimmedName,
        role: normalizeRoleForDatabase(role),
        power: parseNumber(power),
        level: level.trim() ? parseNumber(level) : null,
        notes: notes.trim() || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        throw insertError;
      }

      router.replace("/members");
    } catch (error) {
      Alert.alert(
        "Could not add member",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireActiveAlliance>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Members</Text>
          <Text style={styles.title}>Add Member</Text>
          <Text style={styles.subtitle}>
            Add a member to your alliance roster. They do not need to have an
            app account.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Member name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
              editable={!saving}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Role</Text>

            <View style={styles.roleGrid}>
              {MEMBER_ROLES.map((memberRole) => {
                const selected = role === memberRole;

                return (
                  <Pressable
                    key={memberRole}
                    style={[styles.roleChip, selected && styles.roleChipActive]}
                    onPress={() => setRole(memberRole)}
                    disabled={saving}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        selected && styles.roleChipTextActive,
                      ]}
                    >
                      {formatRole(memberRole)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Power</Text>
            <TextInput
              value={power}
              onChangeText={setPower}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              style={styles.input}
              editable={!saving}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>HQ Level</Text>
            <TextInput
              value={level}
              onChangeText={setLevel}
              placeholder="Optional"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              style={styles.input}
              editable={!saving}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="sentences"
              multiline
              style={[styles.input, styles.notesInput]}
              editable={!saving}
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "Saving..." : "Save Member"}
              </Text>
            </Pressable>
          </View>
        </View>
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
  header: {
    marginBottom: 20,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 22,
    backgroundColor: "#ffffff",
    padding: 18,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
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
  notesInput: {
    minHeight: 86,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  roleChip: {
    minHeight: 38,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d8d8d8",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  roleChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  roleChipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  roleChipTextActive: {
    color: "#ffffff",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d8d8d8",
    backgroundColor: "#ffffff",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
