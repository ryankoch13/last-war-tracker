import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useActiveAlliance } from "@/hooks/useActiveAlliance";
import {
  AllianceEvent,
  AllianceMember,
  BoardItemStatus,
  useAllianceStore,
} from "@/store/allianceStore";
import { colors } from "@/theme/colors";

function formatEventDate(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  const dateKey = value.slice(0, 10);
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return dateKey;
  }

  return new Date(year, month - 1, day).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getAssignedMemberNames(
  members: AllianceMember[],
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

function sortActiveEvents(events: AllianceEvent[]) {
  return events.slice().sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
  });
}

function sortCompletedEvents(events: AllianceEvent[]) {
  return events.slice().sort((a, b) => {
    const aDate = a.completedAt ?? a.date ?? "";
    const bDate = b.completedAt ?? b.date ?? "";

    return bDate.localeCompare(aDate);
  });
}

export function EventBoardScreen() {
  const { canManageAlliance, loading } = useActiveAlliance();

  const members = useAllianceStore((state) => state.members ?? []);
  const events = useAllianceStore((state) => state.events ?? []);
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

  const [actionEventId, setActionEventId] = useState<string | null>(null);

  const activeEvents = useMemo(() => {
    return sortActiveEvents(
      events.filter((event) => event.status !== BoardItemStatus.Completed),
    );
  }, [events]);

  const completedEvents = useMemo(() => {
    return sortCompletedEvents(
      events.filter((event) => event.status === BoardItemStatus.Completed),
    );
  }, [events]);

  async function runEventAction(
    eventId: string,
    action: () => Promise<void>,
    errorTitle: string,
  ) {
    try {
      setActionEventId(eventId);
      await action();
    } catch (error) {
      Alert.alert(
        errorTitle,
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setActionEventId(null);
    }
  }

  function clearAssignedMembersForEvent(eventId: string) {
    void runEventAction(
      eventId,
      () =>
        updateAllianceEvent(eventId, {
          assignedMemberIds: [],
          updatedAt: new Date().toISOString(),
        }),
      "Could not clear members",
    );
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
          onPress: () =>
            void runEventAction(
              eventId,
              () => completeAllianceEvent(eventId),
              "Could not complete event",
            ),
        },
      ],
    );
  }

  function confirmReopenEvent(eventId: string) {
    void runEventAction(
      eventId,
      () => reopenAllianceEvent(eventId),
      "Could not reopen event",
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
        onPress: () =>
          void runEventAction(
            eventId,
            () => deleteAllianceEvent(eventId),
            "Could not delete event",
          ),
      },
    ]);
  }

  function renderEventCard(event: AllianceEvent, completed = false) {
    const busy = actionEventId === event.id;

    return (
      <View key={event.id} style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.eventHeaderText}>
            <Text style={styles.eventTitle}>{event.name}</Text>
            <Text style={styles.eventMeta}>
              {event.type} · {formatEventDate(event.date)}
            </Text>
          </View>

          <View style={completed ? styles.completedBadge : styles.statusBadge}>
            <Text
              style={
                completed ? styles.completedBadgeText : styles.statusBadgeText
              }
            >
              {completed ? "Completed" : "Active"}
            </Text>
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

        {canManageAlliance ? (
          <View style={styles.actionRow}>
            {!completed ? (
              <>
                <Pressable
                  style={[
                    styles.secondaryButton,
                    busy && styles.disabledButton,
                  ]}
                  onPress={() => clearAssignedMembersForEvent(event.id)}
                  disabled={busy}
                >
                  <Text style={styles.secondaryButtonText}>Clear Members</Text>
                </Pressable>

                <Pressable
                  style={[styles.completeButton, busy && styles.disabledButton]}
                  onPress={() => confirmCompleteEvent(event.id)}
                  disabled={busy}
                >
                  <Text style={styles.completeButtonText}>Complete</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={[styles.secondaryButton, busy && styles.disabledButton]}
                onPress={() => confirmReopenEvent(event.id)}
                disabled={busy}
              >
                <Text style={styles.secondaryButtonText}>Reopen</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.deleteButton, busy && styles.disabledButton]}
              onPress={() => confirmDeleteEvent(event.id)}
              disabled={busy}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Text style={styles.eyebrow}>Alliance Events</Text>
            <Text style={styles.title}>Event Board</Text>
            <Text style={styles.subtitle}>
              Track active alliance events, assigned members, and completed
              event history.
            </Text>
          </View>

          {canManageAlliance ? (
            <Pressable
              style={styles.addButton}
              onPress={() => router.push("/events/new")}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          ) : null}
        </View>

        {!canManageAlliance ? (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>View-only access</Text>
            <Text style={styles.permissionText}>
              Only R4 and R5 members can create or manage events.
            </Text>
          </View>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Loading events...</Text>
          <Text style={styles.emptyText}>
            Your alliance event board is being refreshed.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Events</Text>
              <Text style={styles.sectionCount}>{activeEvents.length}</Text>
            </View>

            {activeEvents.length > 0 ? (
              activeEvents.map((event) => renderEventCard(event))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No active events</Text>
                <Text style={styles.emptyText}>
                  {canManageAlliance
                    ? "Tap Add to create your first alliance event."
                    : "R4 and R5 members can create events for the alliance."}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>History</Text>
              <Text style={styles.sectionCount}>{completedEvents.length}</Text>
            </View>

            {completedEvents.length > 0 ? (
              completedEvents.map((event) => renderEventCard(event, true))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No event history yet</Text>
                <Text style={styles.emptyText}>
                  Completed events will appear here.
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  titleCopy: {
    flex: 1,
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
  addButton: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  permissionCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    marginTop: 18,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  permissionText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
  },
  sectionCount: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "900",
  },
  eventCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
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
    backgroundColor: "rgba(124, 58, 237, 0.16)",
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
    backgroundColor: "rgba(34, 197, 94, 0.14)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  completedBadgeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "900",
  },
  eventRow: {
    marginBottom: 10,
  },
  eventLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
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
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
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
    backgroundColor: "rgba(220, 38, 38, 0.14)",
    paddingHorizontal: 14,
    marginTop: 8,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "900",
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
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
  disabledButton: {
    opacity: 0.6,
  },
});
