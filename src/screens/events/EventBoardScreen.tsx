import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { AppButton } from "../../components/AppButton";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";
import type {
    AllianceEvent,
    AllianceEventType,
    AllianceMember,
} from "../../types/alliance";

const eventTypes: AllianceEventType[] = [
  "VS",
  "Desert Storm",
  "Capital War",
  "Rare Soil",
  "Train",
  "Custom",
];

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getMemberNames(members: AllianceMember[], memberIds: string[]) {
  if (memberIds.length === 0) return "None assigned";

  return memberIds
    .map((memberId) => {
      return members.find((member) => member.id === memberId)?.username;
    })
    .filter(Boolean)
    .join(", ");
}

type EventFormState = {
  id?: string;
  name: string;
  type: AllianceEventType;
  date: string;
  notes: string;
};

const emptyForm: EventFormState = {
  name: "",
  type: "VS",
  date: getTodayDateKey(),
  notes: "",
};

export function EventBoardScreen() {
  const [eventForm, setEventForm] = useState<EventFormState | null>(null);
  const [memberPickerEventId, setMemberPickerEventId] = useState<string | null>(
    null,
  );

  const members = useAllianceStore((state) => state.members);
  const events = useAllianceStore((state) => state.events);

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

  const activeEvents = useMemo(() => {
    return events
      .filter((event) => event.status !== "completed")
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  const completedEvents = useMemo(() => {
    return events
      .filter((event) => event.status === "completed")
      .slice()
      .sort((a, b) => {
        const aDate = a.completedAt ?? a.date;
        const bDate = b.completedAt ?? b.date;
        return bDate.localeCompare(aDate);
      });
  }, [events]);

  const selectedPickerEvent = useMemo(() => {
    if (!memberPickerEventId) return undefined;
    return events.find((event) => event.id === memberPickerEventId);
  }, [events, memberPickerEventId]);

  function openCreateEvent() {
    setEventForm({
      ...emptyForm,
      date: getTodayDateKey(),
    });
  }

  function openEditEvent(event: AllianceEvent) {
    setEventForm({
      id: event.id,
      name: event.name,
      type: event.type,
      date: event.date,
      notes: event.notes ?? "",
    });
  }

  function saveEventForm() {
    if (!eventForm) return;

    const trimmedName = eventForm.name.trim();

    if (!trimmedName) {
      Alert.alert("Missing event name", "Please enter a name for this event.");
      return;
    }

    if (eventForm.id) {
      updateAllianceEvent(eventForm.id, {
        name: trimmedName,
        type: eventForm.type,
        date: eventForm.date.trim() || getTodayDateKey(),
        notes: eventForm.notes.trim(),
      });
    } else {
      addAllianceEvent({
        name: trimmedName,
        type: eventForm.type,
        date: eventForm.date.trim() || getTodayDateKey(),
        notes: eventForm.notes.trim(),
      });
    }

    setEventForm(null);
  }

  function confirmCompleteEvent(event: AllianceEvent) {
    Alert.alert(
      "Complete event?",
      "This will move the event to past event history.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Complete",
          onPress: () => completeAllianceEvent(event.id),
        },
      ],
    );
  }

  function confirmDeleteEvent(event: AllianceEvent) {
    Alert.alert("Delete event?", "This will permanently delete this event.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteAllianceEvent(event.id),
      },
    ]);
  }

  function toggleAssignedMember(memberId: string) {
    if (!selectedPickerEvent) return;

    const isAssigned = selectedPickerEvent.assignedMemberIds.includes(memberId);

    updateAllianceEvent(selectedPickerEvent.id, {
      assignedMemberIds: isAssigned
        ? selectedPickerEvent.assignedMemberIds.filter((id) => id !== memberId)
        : [...selectedPickerEvent.assignedMemberIds, memberId],
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Events",
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Alliance Events</Text>
            <Text style={styles.subtitle}>
              Create event boards, assign members, and keep a history of past
              alliance events.
            </Text>
          </View>

          <AppButton title="Add Event" onPress={openCreateEvent} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Events</Text>

          {activeEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No active events yet. Add one to start assigning members.
              </Text>
            </View>
          ) : (
            activeEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                members={members}
                onEdit={() => openEditEvent(event)}
                onAssignMembers={() => setMemberPickerEventId(event.id)}
                onComplete={() => confirmCompleteEvent(event)}
                onDelete={() => confirmDeleteEvent(event)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Events</Text>

          {completedEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Completed events will appear here.
              </Text>
            </View>
          ) : (
            completedEvents.map((event) => (
              <HistoryEventCard
                key={event.id}
                event={event}
                members={members}
                onReopen={() => reopenAllianceEvent(event.id)}
                onDelete={() => confirmDeleteEvent(event)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={!!eventForm}
        transparent
        animationType="slide"
        onRequestClose={() => setEventForm(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {eventForm?.id ? "Edit Event" : "Add Event"}
              </Text>

              <Pressable
                onPress={() => setEventForm(null)}
                hitSlop={10}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.modalClose}>Cancel</Text>
              </Pressable>
            </View>

            {eventForm && (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Event Name</Text>
                  <TextInput
                    value={eventForm.name}
                    onChangeText={(name) =>
                      setEventForm((current) =>
                        current ? { ...current, name } : current,
                      )
                    }
                    placeholder="Alliance Duel, Desert Storm, Capital War..."
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Event Type</Text>

                  <View style={styles.typeGrid}>
                    {eventTypes.map((type) => {
                      const selected = eventForm.type === type;

                      return (
                        <Pressable
                          key={type}
                          onPress={() =>
                            setEventForm((current) =>
                              current ? { ...current, type } : current,
                            )
                          }
                          style={({ pressed }) => [
                            styles.typePill,
                            selected && styles.typePillSelected,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.typePillText,
                              selected && styles.typePillTextSelected,
                            ]}
                          >
                            {type}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Date</Text>
                  <TextInput
                    value={eventForm.date}
                    onChangeText={(date) =>
                      setEventForm((current) =>
                        current ? { ...current, date } : current,
                      )
                    }
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Notes</Text>
                  <TextInput
                    value={eventForm.notes}
                    onChangeText={(notes) =>
                      setEventForm((current) =>
                        current ? { ...current, notes } : current,
                      )
                    }
                    placeholder="Optional notes..."
                    placeholderTextColor={colors.muted}
                    multiline
                    style={[styles.input, styles.notesInput]}
                  />
                </View>

                <AppButton title="Save Event" onPress={saveEventForm} />
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!memberPickerEventId}
        transparent
        animationType="slide"
        onRequestClose={() => setMemberPickerEventId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Members</Text>

              <Pressable
                onPress={() => setMemberPickerEventId(null)}
                hitSlop={10}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.modalClose}>Done</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.memberList}>
              {members.map((member) => {
                const selected =
                  selectedPickerEvent?.assignedMemberIds.includes(member.id) ??
                  false;

                return (
                  <Pressable
                    key={member.id}
                    onPress={() => toggleAssignedMember(member.id)}
                    style={({ pressed }) => [
                      styles.memberRow,
                      selected && styles.memberRowSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View>
                      <Text style={styles.memberName}>{member.username}</Text>
                      <Text style={styles.memberMeta}>
                        {member.rank} · HQ {member.hqLevel}
                      </Text>
                    </View>

                    <Text style={styles.checkmark}>{selected ? "✓" : ""}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function EventCard({
  event,
  members,
  onEdit,
  onAssignMembers,
  onComplete,
  onDelete,
}: {
  event: AllianceEvent;
  members: AllianceMember[];
  onEdit: () => void;
  onAssignMembers: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardTitle}>{event.name}</Text>
        <Text style={styles.cardMeta}>
          {event.type} · {event.date}
        </Text>
      </View>

      <View style={styles.assignmentBox}>
        <Text style={styles.assignmentLabel}>Assigned Members</Text>
        <Text style={styles.assignmentValue}>
          {getMemberNames(members, event.assignedMemberIds)}
        </Text>
      </View>

      {!!event.notes?.trim() && (
        <Text style={styles.notesText}>{event.notes.trim()}</Text>
      )}

      <View style={styles.actionsRow}>
        <SmallButton title="Members" onPress={onAssignMembers} />
        <SmallButton title="Edit" onPress={onEdit} />
      </View>

      <View style={styles.actionsRow}>
        <SmallButton title="Complete" variant="primary" onPress={onComplete} />
        <SmallButton title="Delete" variant="danger" onPress={onDelete} />
      </View>
    </View>
  );
}

function HistoryEventCard({
  event,
  members,
  onReopen,
  onDelete,
}: {
  event: AllianceEvent;
  members: AllianceMember[];
  onReopen: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardTitle}>{event.name}</Text>
        <Text style={styles.cardMeta}>
          Completed {event.completedAt ?? event.date} · {event.type}
        </Text>
      </View>

      <Text style={styles.historyText}>
        Assigned: {getMemberNames(members, event.assignedMemberIds)}
      </Text>

      {!!event.notes?.trim() && (
        <Text style={styles.notesText}>{event.notes.trim()}</Text>
      )}

      <View style={styles.actionsRow}>
        <SmallButton title="Reopen" onPress={onReopen} />
        <SmallButton title="Delete" variant="danger" onPress={onDelete} />
      </View>
    </View>
  );
}

function SmallButton({
  title,
  variant = "default",
  onPress,
}: {
  title: string;
  variant?: "default" | "primary" | "danger";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.smallButton,
        variant === "primary" && styles.primaryButton,
        variant === "danger" && styles.dangerButton,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.smallButtonText,
          variant === "primary" && styles.primaryButtonText,
          variant === "danger" && styles.dangerButtonText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 18,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 16,
  },
  headerText: {
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    lineHeight: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  emptyText: {
    color: colors.muted,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  cardMeta: {
    color: colors.muted,
    marginTop: 2,
  },
  assignmentBox: {
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 4,
  },
  assignmentLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  assignmentValue: {
    color: colors.text,
    fontWeight: "800",
    lineHeight: 20,
  },
  notesText: {
    color: colors.muted,
    lineHeight: 20,
  },
  historyText: {
    color: colors.muted,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  smallButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallButtonText: {
    color: colors.text,
    fontWeight: "900",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  primaryButtonText: {
    color: "#fff",
  },
  dangerButton: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  dangerButtonText: {
    color: "#b91c1c",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "86%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  modalClose: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: 12,
    fontWeight: "700",
  },
  notesInput: {
    minHeight: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typePill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typePillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typePillText: {
    color: colors.text,
    fontWeight: "800",
  },
  typePillTextSelected: {
    color: "#fff",
  },
  memberList: {
    gap: 10,
    paddingBottom: 24,
  },
  memberRow: {
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memberRowSelected: {
    borderColor: colors.primary,
  },
  memberName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  memberMeta: {
    color: colors.muted,
    marginTop: 2,
  },
  checkmark: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.65,
  },
});
