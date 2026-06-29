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
import {
  AllianceEventType,
  BoardItemStatus,
  useAllianceStore,
} from "@/store/allianceStore";
import { colors } from "@/theme/colors";

const EVENT_TYPES = [
  AllianceEventType.VS,
  AllianceEventType.DesertStorm,
  AllianceEventType.CapitalWar,
  AllianceEventType.RareSoil,
  AllianceEventType.Train,
  AllianceEventType.Custom,
];

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function getAssignedMemberNames(
  members: Array<{ id: string; name: string }>,
  assignedMemberIds?: string[],
) {
  const safeAssignedMemberIds = assignedMemberIds ?? [];

  if (safeAssignedMemberIds.length === 0) {
    return "None assigned";
  }

  const names = safeAssignedMemberIds
    .map((memberId) => members.find((member) => member.id === memberId)?.name)
    .filter(Boolean);

  return names.length > 0 ? names.join(", ") : "None assigned";
}

export function EventBoardScreen() {
  const members = useAllianceStore((state) => state.members ?? []);
  const events = useAllianceStore((state) => state.events ?? []);

  const addAllianceEvent = useAllianceStore((state) => state.addAllianceEvent);
  const updateAllianceEvent = useAllianceStore(
    (state) => state.updateAllianceEvent,
  );
  const completeAllianceEvent = useAllianceStore(
    (state) => state.completeAllianceEvent,
  );
  const reopenAllianceEvent = useAllianceStore(
    (state) => state.reopenAllianceEvent,
  );
  const deleteAllianceEvent = useAllianceStore(
    (state) => state.deleteAllianceEvent,
  );

  const [name, setName] = useState("");
  const [type, setType] = useState<AllianceEventType>(AllianceEventType.VS);
  const [date, setDate] = useState(todayString());
  const [notes, setNotes] = useState("");
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);

  const activeMembers = useMemo(() => {
    return members
      .filter((member) => member.isActive !== false)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  const activeEvents = useMemo(() => {
    return events
      .filter((event) => event.status !== BoardItemStatus.Completed)
      .slice()
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      });
  }, [events]);

  const completedEvents = useMemo(() => {
    return events
      .filter((event) => event.status === BoardItemStatus.Completed)
      .slice()
      .sort((a, b) => {
        const aDate = a.completedAt ?? a.date ?? "";
        const bDate = b.completedAt ?? b.date ?? "";

        return bDate.localeCompare(aDate);
      });
  }, [events]);

  function resetForm() {
    setName("");
    setType(AllianceEventType.VS);
    setDate(todayString());
    setNotes("");
    setAssignedMemberIds([]);
  }

  function toggleAssignedMember(memberId: string) {
    setAssignedMemberIds((currentIds) => {
      if (currentIds.includes(memberId)) {
        return currentIds.filter((currentId) => currentId !== memberId);
      }

      return [...currentIds, memberId];
    });
  }

  function handleAddEvent() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Event name required", "Enter a name for the event.");
      return;
    }

    addAllianceEvent({
      name: trimmedName,
      type,
      date: date.trim() || todayString(),
      notes: notes.trim(),
      assignedMemberIds,
      status: BoardItemStatus.Active,
      completedAt: null,
      updatedAt: new Date().toISOString(),
    });

    resetForm();
  }

  function clearAssignedMembersForEvent(eventId: string) {
    updateAllianceEvent(eventId, {
      assignedMemberIds: [],
    });
  }

  function confirmCompleteEvent(eventId: string) {
    Alert.alert(
      "Complete event?",
      "This will move the event to completed history.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Complete",
          onPress: () => completeAllianceEvent(eventId),
        },
      ],
    );
  }

  function confirmDeleteEvent(eventId: string) {
    Alert.alert("Delete event?", "This will permanently remove this event.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteAllianceEvent(eventId),
      },
    ]);
  }

  return (
    <RequireActiveAlliance>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Alliance Events</Text>
          <Text style={styles.title}>Event Board</Text>
          <Text style={styles.subtitle}>
            Track active alliance events, assign members, and keep a completed
            event history.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>New Event</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Event Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Alliance Duel Push, Desert Storm, Capital War..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
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
                    style={[styles.typeChip, selected && styles.typeChipActive]}
                    onPress={() => setType(eventType)}
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
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Assigned Members</Text>

            {activeMembers.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.memberPicker}
              >
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
              </ScrollView>
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
            />
          </View>

          <Pressable style={styles.primaryButton} onPress={handleAddEvent}>
            <Text style={styles.primaryButtonText}>Add Event</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Events</Text>

          {activeEvents.length > 0 ? (
            activeEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventHeaderText}>
                    <Text style={styles.eventTitle}>{event.name}</Text>
                    <Text style={styles.eventMeta}>
                      {event.type} · {event.date}
                    </Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Active</Text>
                  </View>
                </View>

                <View style={styles.eventRow}>
                  <Text style={styles.eventLabel}>Assigned Members</Text>
                  <Text style={styles.eventValue}>
                    {getAssignedMemberNames(members, event.assignedMemberIds)}
                  </Text>
                </View>

                {event.notes ? (
                  <Text style={styles.eventNotes}>{event.notes}</Text>
                ) : null}

                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => clearAssignedMembersForEvent(event.id)}
                  >
                    <Text style={styles.secondaryButtonText}>
                      Clear Members
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.completeButton}
                    onPress={() => confirmCompleteEvent(event.id)}
                  >
                    <Text style={styles.completeButtonText}>Complete</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => confirmDeleteEvent(event.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No active events</Text>
              <Text style={styles.emptyText}>
                Add an event above to start building your alliance event board.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>

          {completedEvents.length > 0 ? (
            completedEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventHeaderText}>
                    <Text style={styles.eventTitle}>{event.name}</Text>
                    <Text style={styles.eventMeta}>
                      {event.type} · {event.date}
                    </Text>
                  </View>

                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                </View>

                <View style={styles.eventRow}>
                  <Text style={styles.eventLabel}>Assigned Members</Text>
                  <Text style={styles.eventValue}>
                    {getAssignedMemberNames(members, event.assignedMemberIds)}
                  </Text>
                </View>

                {event.notes ? (
                  <Text style={styles.eventNotes}>{event.notes}</Text>
                ) : null}

                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => reopenAllianceEvent(event.id)}
                  >
                    <Text style={styles.secondaryButtonText}>Reopen</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => confirmDeleteEvent(event.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No event history yet</Text>
              <Text style={styles.emptyText}>
                Completed events will appear here.
              </Text>
            </View>
          )}
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
    marginBottom: 24,
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
    fontSize: 20,
    fontWeight: "900",
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
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  typeChip: {
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
  memberPicker: {
    paddingRight: 20,
  },
  memberChip: {
    minHeight: 38,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d8d8d8",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    marginRight: 8,
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
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 12,
  },
  eventCard: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  eventHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  eventTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  eventMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(79, 70, 229, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  completedBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  completedBadgeText: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: "900",
  },
  eventRow: {
    marginBottom: 10,
  },
  eventLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  eventValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
  eventNotes: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  secondaryButton: {
    minHeight: 38,
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8d8d8",
    paddingHorizontal: 14,
    marginRight: 8,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  completeButton: {
    minHeight: 38,
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    marginRight: 8,
    marginTop: 8,
  },
  completeButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  deleteButton: {
    minHeight: 38,
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    paddingHorizontal: 14,
    marginTop: 8,
  },
  deleteButtonText: {
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: "900",
  },
  emptyCard: {
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 18,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
