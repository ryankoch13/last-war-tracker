import { router } from "expo-router";
import { useMemo, useState } from "react";
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
import { useActiveAlliance } from "@/hooks/useActiveAlliance";
import {
    AllianceEventType,
    BoardItemStatus,
    useAllianceStore,
} from "@/store/allianceStore";
import { colors } from "@/theme/colors";

const EVENT_TYPES: AllianceEventType[] = [
  AllianceEventType.VS,
  AllianceEventType.DesertStorm,
  AllianceEventType.CapitalWar,
  AllianceEventType.RareSoil,
  AllianceEventType.Train,
  AllianceEventType.Custom,
];

function getLocalDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

export function AddEventScreen() {
  const { canManageAlliance, loading } = useActiveAlliance();

  const members = useAllianceStore((state) => state.members ?? []);
  const addAllianceEvent = useAllianceStore((state) => state.addAllianceEvent);

  const [name, setName] = useState("");
  const [type, setType] = useState<AllianceEventType>(AllianceEventType.VS);
  const [date, setDate] = useState(getLocalDateKey());
  const [notes, setNotes] = useState("");
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const activeMembers = useMemo(() => {
    return members
      .filter((member) => member.isActive !== false)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  function toggleAssignedMember(memberId: string) {
    setAssignedMemberIds((currentIds) => {
      if (currentIds.includes(memberId)) {
        return currentIds.filter((currentId) => currentId !== memberId);
      }

      return [...currentIds, memberId];
    });
  }

  async function handleAddEvent() {
    if (!canManageAlliance) {
      Alert.alert(
        "Permission required",
        "Only R4 and R5 members can add alliance events.",
      );
      return;
    }

    const trimmedName = name.trim();
    const trimmedDate = date.trim();

    if (!trimmedName) {
      Alert.alert("Event name required", "Enter a name for the event.");
      return;
    }

    if (!isValidDateKey(trimmedDate)) {
      Alert.alert(
        "Invalid date",
        "Enter the date in YYYY-MM-DD format, like 2026-06-30.",
      );
      return;
    }

    try {
      setSaving(true);

      await addAllianceEvent({
        name: trimmedName,
        type,
        date: date.trim() || getLocalDateKey(),
        notes: notes.trim() || null,
        assignedMemberIds,
        status: BoardItemStatus.Active,
        completedAt: null,
        updatedAt: new Date().toISOString(),
      });

      router.back();
    } catch (error) {
      Alert.alert(
        "Could not create event",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <RequireActiveAlliance>
        <View style={styles.centeredContainer}>
          <Text style={styles.loadingText}>Loading permissions...</Text>
        </View>
      </RequireActiveAlliance>
    );
  }

  return (
    <RequireActiveAlliance>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>R4 / R5 Tools</Text>
          <Text style={styles.title}>Add Event</Text>
          <Text style={styles.subtitle}>
            Create an alliance event and assign members who should be
            responsible for it.
          </Text>
        </View>

        {!canManageAlliance ? (
          <View style={styles.lockedCard}>
            <Text style={styles.lockedTitle}>Manager access required</Text>
            <Text style={styles.lockedText}>
              Only R4 and R5 members can create alliance events. You can still
              view the event board from the Events tab.
            </Text>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>Back to Events</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Event Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Alliance Duel, Desert Storm, train reset..."
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.input}
                editable={!saving}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Event Type</Text>

              <View style={styles.typeGrid}>
                {EVENT_TYPES.map((eventType) => {
                  const selected = type === eventType;

                  return (
                    <Pressable
                      key={eventType}
                      style={[
                        styles.typeChip,
                        selected && styles.typeChipActive,
                      ]}
                      onPress={() => setType(eventType)}
                      disabled={saving}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          selected && styles.typeChipTextActive,
                        ]}
                      >
                        {eventType}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                editable={!saving}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Assigned Members</Text>

              {activeMembers.length > 0 ? (
                <View style={styles.memberGrid}>
                  {activeMembers.map((member) => {
                    const selected = assignedMemberIds.includes(member.id);

                    return (
                      <Pressable
                        key={member.id}
                        style={[
                          styles.memberChip,
                          selected && styles.memberChipActive,
                        ]}
                        onPress={() => toggleAssignedMember(member.id)}
                        disabled={saving}
                      >
                        <Text
                          style={[
                            styles.memberChipText,
                            selected && styles.memberChipTextActive,
                          ]}
                        >
                          {member.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyText}>
                  Add members before assigning them to events.
                </Text>
              )}
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

            <Pressable
              style={[styles.primaryButton, saving && styles.disabledButton]}
              onPress={handleAddEvent}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "Creating..." : "Create Event"}
              </Text>
            </Pressable>
          </View>
        )}
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
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "700",
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
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  lockedCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  lockedTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },
  lockedText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
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
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.inputText,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  notesInput: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  typeChip: {
    minHeight: 38,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  typeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  typeChipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  typeChipTextActive: {
    color: "#ffffff",
  },
  memberGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  memberChip: {
    minHeight: 38,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  memberChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  memberChipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  memberChipTextActive: {
    color: "#ffffff",
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
