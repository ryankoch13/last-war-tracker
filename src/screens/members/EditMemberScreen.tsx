import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import { AllianceRole } from "@/store/allianceStore";
import { AppButton } from "../../components/AppButton";
import { useAllianceStore } from "../../store/allianceStore";
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
  const params = useLocalSearchParams<{ memberId?: string | string[] }>();

  const memberId = Array.isArray(params.memberId)
    ? params.memberId[0]
    : params.memberId;

  const existingMember = useAllianceStore((state) => {
    if (!memberId) return undefined;

    return (state.members ?? []).find((member) => member.id === memberId);
  });

  const addMember = useAllianceStore((state) => state.addMember);
  const updateMember = useAllianceStore((state) => state.updateMember);

  const isEditing = !!memberId;

  const [name, setName] = useState(existingMember?.name ?? "");
  const [role, setRole] = useState<AllianceRole>(
    existingMember?.role ?? AllianceRole.R3,
  );
  const [power, setPower] = useState(existingMember?.power?.toString() ?? "");
  const [level, setLevel] = useState(existingMember?.level?.toString() ?? "");
  const [notes, setNotes] = useState(existingMember?.notes ?? "");

  useEffect(() => {
    if (!existingMember) return;

    setName(existingMember.name ?? "");
    setRole(existingMember.role ?? AllianceRole.R3);
    setPower(existingMember.power?.toString() ?? "");
    setLevel(existingMember.level?.toString() ?? "");
    setNotes(existingMember.notes ?? "");
  }, [existingMember]);

  const title = useMemo(() => {
    return isEditing ? "Save Changes" : "Create Member";
  }, [isEditing]);

  async function save() {
    if (isEditing && !existingMember) {
      Alert.alert(
        "Member not found",
        "This member could not be loaded. Please go back and try again.",
      );
      return;
    }

    const trimmedName = name.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedName) {
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

    const payload = {
      name: trimmedName,
      role,
      power: parsedPower,
      level: parsedLevel,
      notes: trimmedNotes,
    };

    try {
      if (memberId) {
        await updateMember(memberId, payload);
      } else {
        await addMember(payload);
      }

      router.back();
    } catch (error) {
      console.error("SAVE MEMBER ERROR", error);
      Alert.alert("Error", "Could not save member.");
    }
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
          <Field
            label="Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <RoleDropdown value={role} onChange={setRole} />

          <Field
            label="Power"
            value={power}
            onChangeText={setPower}
            keyboardType="number-pad"
            placeholder="0"
          />

          <Field
            label="HQ Level"
            value={level}
            onChangeText={setLevel}
            keyboardType="number-pad"
            placeholder="0"
          />

          <Field
            label="R4 Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={styles.notesInput}
          />

          <AppButton title={title} onPress={save} />
        </ScrollView>
      </KeyboardAvoidingView>
    </RequireActiveAlliance>
  );
}

type RoleDropdownProps = {
  value: AllianceRole;
  onChange: (role: AllianceRole) => void;
};

function RoleDropdown({ value, onChange }: RoleDropdownProps) {
  const [open, setOpen] = useState(false);

  function selectRole(nextRole: AllianceRole) {
    onChange(nextRole);
    setOpen(false);
  }

  return (
    <View>
      <Text style={styles.label}>Role</Text>

      <Pressable
        style={styles.dropdownButton}
        onPress={() => setOpen((current) => !current)}
      >
        <Text style={styles.dropdownButtonText}>{value}</Text>
        <Text style={styles.dropdownChevron}>{open ? "▲" : "▼"}</Text>
      </Pressable>

      {open ? (
        <View style={styles.dropdownMenu}>
          {VALID_ROLES.map((item) => {
            const selected = item === value;

            return (
              <Pressable
                key={item}
                style={[
                  styles.dropdownItem,
                  selected && styles.dropdownItemSelected,
                ]}
                onPress={() => selectRole(item)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selected && styles.dropdownItemTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
};

function Field({ label, style, ...props }: FieldProps) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        {...props}
      />
    </>
  );
}

function parseNumberInput(value: string) {
  return Number(value.replace(/,/g, "").trim() || 0);
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
    gap: 10,
  },
  label: {
    color: colors.text,
    fontWeight: "800",
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  notesInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  dropdownButton: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  dropdownChevron: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  dropdownMenu: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginTop: 6,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.card,
  },
  dropdownItemText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  dropdownItemTextSelected: {
    color: colors.primary,
  },
});
