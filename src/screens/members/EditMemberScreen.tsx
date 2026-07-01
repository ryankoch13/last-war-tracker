import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState, type ComponentProps } from "react";
import {
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

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { useCanManageAlliance } from "@/hooks/useActiveAlliance";
import type { AllianceMember } from "@/types/alliance";
import { AppButton } from "../../components/AppButton";
import { AllianceRole, useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";

const VALID_ROLES: AllianceRole[] = [
  AllianceRole.R1,
  AllianceRole.R2,
  AllianceRole.R3,
  AllianceRole.R4,
  AllianceRole.R5,
];

export function EditMemberScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    memberId?: string | string[];
  }>();

  const memberId = Array.isArray(params.memberId)
    ? params.memberId[0]
    : params.memberId;

  const existingMember = useAllianceStore((state) => {
    if (!memberId) return undefined;
    return (state.members ?? []).find((member) => member.id === memberId);
  });

  const allianceUser = useAllianceStore((state) => state.allianceUser);
  const canManageAlliance = useCanManageAlliance();

  const addMember = useAllianceStore((state) => state.addMember);
  const updateMember = useAllianceStore((state) => state.updateMember);
  const updateMemberRole = useAllianceStore((state) => state.updateMemberRole);
  const updateOwnMemberProgress = useAllianceStore(
    (state) => state.updateOwnMemberProgress,
  );

  const isEditing = Boolean(memberId);

  const isOwnMember = Boolean(
    existingMember?.userId && existingMember.userId === allianceUser?.userId,
  );

  const canUseScreen = canManageAlliance || (isEditing && isOwnMember);
  const canEditIdentityFields = canManageAlliance;
  const canEditProgressFields = canManageAlliance || isOwnMember;

  const [name, setName] = useState(existingMember?.name ?? "");
  const [role, setRole] = useState<AllianceRole>(
    existingMember?.role ?? AllianceRole.R1,
  );
  const [power, setPower] = useState(existingMember?.power?.toString() ?? "");
  const [level, setLevel] = useState(existingMember?.level?.toString() ?? "");
  const [notes, setNotes] = useState(existingMember?.notes ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existingMember) return;

    setName(existingMember.name ?? "");
    setRole(existingMember.role ?? AllianceRole.R1);
    setPower(existingMember.power?.toString() ?? "");
    setLevel(existingMember.level?.toString() ?? "");
    setNotes(existingMember.notes ?? "");
  }, [existingMember]);

  const buttonTitle = useMemo(() => {
    if (saving) return "Saving...";

    if (!canManageAlliance && isOwnMember) {
      return "Update My Info";
    }

    return isEditing ? "Save Changes" : "Create Member";
  }, [canManageAlliance, isEditing, isOwnMember, saving]);

  async function save() {
    if (saving) return;

    if (isEditing && !existingMember) {
      Alert.alert(
        "Member not found",
        "This member could not be loaded. Please go back and try again.",
      );
      return;
    }

    if (!canUseScreen) {
      Alert.alert(
        "Permission required",
        "You can only update your own power and HQ level.",
      );
      return;
    }

    const trimmedName = name.trim();
    const trimmedNotes = notes.trim();

    if (canManageAlliance && !trimmedName) {
      Alert.alert("Missing name", "Add a member name before saving.");
      return;
    }

    if (!VALID_ROLES.includes(role)) {
      Alert.alert("Invalid role", "Role must be R1, R2, R3, R4, or R5.");
      return;
    }

    const parsedPower = parseNumberInput(power);
    const parsedLevel = level.trim() ? parseNumberInput(level) : null;

    if (
      Number.isNaN(parsedPower) ||
      (parsedLevel !== null && Number.isNaN(parsedLevel))
    ) {
      Alert.alert("Invalid numbers", "Power and HQ level must be numbers.");
      return;
    }

    const basePayload: Partial<AllianceMember> = {
      name: trimmedName,
      power: parsedPower,
      level: parsedLevel,
      notes: trimmedNotes,
    };

    try {
      setSaving(true);

      if (memberId && existingMember) {
        const roleChanged = role !== existingMember.role;

        if (canManageAlliance) {
          await updateMember(memberId, basePayload);

          if (roleChanged) {
            await updateMemberRole(memberId, role);
          }
        } else if (isOwnMember) {
          await updateOwnMemberProgress(memberId, {
            power: parsedPower,
            level: parsedLevel,
          });
        } else {
          throw new Error("You can only update your own member profile.");
        }
      } else {
        if (!canManageAlliance) {
          throw new Error("Only R4 and R5 members can add alliance members.");
        }

        await addMember({
          name: trimmedName,
          role,
          power: parsedPower,
          level: parsedLevel,
          notes: trimmedNotes,
          isActive: true,
        });
      }

      router.back();
    } catch (error) {
      console.error("SAVE MEMBER ERROR", error);

      const message =
        error instanceof Error ? error.message : "Could not save member.";

      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  }

  if (isEditing && !existingMember) {
    return (
      <RequireActiveAlliance>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Member not found</Text>
          <Text style={styles.emptyText}>
            This member may have been deleted, or the route may be missing a
            memberId.
          </Text>

          <AppButton title="Go Back" onPress={() => router.back()} />
        </View>
      </RequireActiveAlliance>
    );
  }

  if (!canUseScreen) {
    return (
      <RequireActiveAlliance>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Permission required</Text>
          <Text style={styles.emptyText}>
            You can only update your own power, HQ level, VS score, and
            donations.
          </Text>

          <AppButton title="Go Back" onPress={() => router.back()} />
        </View>
      </RequireActiveAlliance>
    );
  }

  return (
    <RequireActiveAlliance>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.select({
          ios: "padding",
          android: undefined,
        })}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerCard}>
            <Text style={styles.eyebrow}>
              {isEditing ? "Edit Member" : "New Member"}
            </Text>

            <Text style={styles.title}>
              {isEditing ? (existingMember?.name ?? "Member") : "Add Member"}
            </Text>

            <Text style={styles.subtitle}>
              {canManageAlliance
                ? "Update member details, HQ level, power, notes, and rank access."
                : "Update your own HQ level and power."}
            </Text>
          </View>

          <View style={styles.formCard}>
            <Field
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Member name"
              autoCapitalize="words"
              autoCorrect={false}
              editable={canEditIdentityFields}
            />

            {canManageAlliance ? (
              <RolePicker value={role} onChange={setRole} />
            ) : (
              <ReadOnlyRole role={role} />
            )}

            <Field
              label="Power"
              value={power}
              onChangeText={setPower}
              keyboardType="number-pad"
              placeholder="0"
              editable={canEditProgressFields}
            />

            <Field
              label="HQ Level"
              value={level}
              onChangeText={setLevel}
              keyboardType="number-pad"
              placeholder="0"
              editable={canEditProgressFields}
            />

            <Field
              label="R4 Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              autoCapitalize="sentences"
              multiline
              style={styles.notesInput}
              editable={canEditIdentityFields}
            />

            {!canManageAlliance ? (
              <View style={styles.permissionCard}>
                <Text style={styles.permissionTitle}>Limited editing</Text>
                <Text style={styles.permissionText}>
                  You can update your own power and HQ level. R4 and R5 members
                  manage names, notes, ranks, and roster changes.
                </Text>
              </View>
            ) : null}

            <AppButton title={buttonTitle} onPress={save} disabled={saving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </RequireActiveAlliance>
  );
}

export default EditMemberScreen;

type RolePickerProps = {
  value: AllianceRole;
  onChange: (role: AllianceRole) => void;
};

function RolePicker({ value, onChange }: RolePickerProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Rank</Text>

      <View style={styles.roleGrid}>
        {VALID_ROLES.map((item) => {
          const selected = item === value;

          return (
            <Pressable
              key={item}
              style={[styles.roleChip, selected && styles.roleChipSelected]}
              onPress={() => onChange(item)}
            >
              <Text
                style={[
                  styles.roleChipText,
                  selected && styles.roleChipTextSelected,
                ]}
              >
                {formatRoleLabel(item)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type ReadOnlyRoleProps = {
  role: AllianceRole;
};

function ReadOnlyRole({ role }: ReadOnlyRoleProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Rank</Text>

      <View style={styles.readOnlyRoleBox}>
        <Text style={styles.readOnlyRoleText}>{formatRoleLabel(role)}</Text>
      </View>
    </View>
  );
}

type FieldProps = ComponentProps<typeof TextInput> & {
  label: string;
};

function Field({ label, style, editable = true, ...props }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        placeholderTextColor={colors.inputPlaceholder}
        editable={editable}
        style={[styles.input, !editable && styles.inputDisabled, style]}
        {...props}
      />
    </View>
  );
}

function parseNumberInput(value: string) {
  return Number(value.replace(/,/g, "").trim() || 0);
}

function formatRoleLabel(role: AllianceRole) {
  return role.toUpperCase();
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    color: colors.inputText,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.65,
  },
  notesInput: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleChip: {
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  roleChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  roleChipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  roleChipTextSelected: {
    color: "#FFFFFF",
  },
  readOnlyRoleBox: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  readOnlyRoleText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  permissionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
    gap: 4,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  permissionText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: "center",
    gap: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
});
