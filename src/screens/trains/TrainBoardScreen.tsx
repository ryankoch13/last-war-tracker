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
  BoardItemStatus,
  TrainAssignment,
  useAllianceStore,
} from "@/store/allianceStore";
import { colors } from "@/theme/colors";

const theme = colors as typeof colors & {
  primary?: string;
  textMuted?: string;
  muted?: string;
  surface?: string;
  border?: string;
};

const primaryColor = theme.primary ?? "#6d28d9";
const mutedColor = theme.textMuted ?? theme.muted ?? "#64748b";
const surfaceColor = theme.surface ?? "#ffffff";
const borderColor = theme.border ?? "#e5e7eb";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function getMemberName(
  members: Array<{ id: string; name: string }>,
  memberId?: string | null,
) {
  if (!memberId) return "Unassigned";

  return members.find((member) => member.id === memberId)?.name ?? "Unknown";
}

function sortAssignmentsByDate(assignments: TrainAssignment[]) {
  return assignments.slice().sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);

    if (dateCompare !== 0) return dateCompare;

    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });
}

export function TrainBoardScreen() {
  const members = useAllianceStore((state) => state.members ?? []);
  const trainAssignments = useAllianceStore(
    (state) => state.trainAssignments ?? [],
  );

  const addTrainAssignment = useAllianceStore(
    (state) => state.addTrainAssignment,
  );
  const updateTrainAssignment = useAllianceStore(
    (state) => state.updateTrainAssignment,
  );
  const completeTrainAssignment = useAllianceStore(
    (state) => state.completeTrainAssignment,
  );
  const reopenTrainAssignment = useAllianceStore(
    (state) => state.reopenTrainAssignment,
  );
  const deleteTrainAssignment = useAllianceStore(
    (state) => state.deleteTrainAssignment,
  );

  const [date, setDate] = useState(todayString());
  const [trainName, setTrainName] = useState("");
  const [notes, setNotes] = useState("");
  const [conductorMemberId, setConductorMemberId] = useState<string | null>(
    null,
  );
  const [passengerMemberId, setPassengerMemberId] = useState<string | null>(
    null,
  );

  const [saving, setSaving] = useState(false);
  const [workingAssignmentId, setWorkingAssignmentId] = useState<string | null>(
    null,
  );

  const activeMembers = useMemo(() => {
    return members
      .filter((member) => member.isActive !== false)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  const activeAssignments = useMemo(() => {
    return sortAssignmentsByDate(
      trainAssignments.filter((assignment) => {
        return assignment.status !== BoardItemStatus.Completed;
      }),
    );
  }, [trainAssignments]);

  const completedAssignments = useMemo(() => {
    return trainAssignments
      .filter((assignment) => {
        return assignment.status === BoardItemStatus.Completed;
      })
      .slice()
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);

        if (dateCompare !== 0) return dateCompare;

        return (b.completedAt ?? b.createdAt ?? "").localeCompare(
          a.completedAt ?? a.createdAt ?? "",
        );
      });
  }, [trainAssignments]);

  function resetForm() {
    setDate(todayString());
    setTrainName("");
    setNotes("");
    setConductorMemberId(null);
    setPassengerMemberId(null);
  }

  async function handleAddAssignment() {
    const trimmedTrainName = trainName.trim();

    if (!trimmedTrainName) {
      Alert.alert("Train name required", "Enter a train name or train type.");
      return;
    }

    try {
      setSaving(true);

      await addTrainAssignment({
        date: date.trim() || todayString(),
        trainName: trimmedTrainName,
        conductorMemberId,
        passengerMemberId,
        notes: notes.trim() || null,
        status: BoardItemStatus.Active,
        completedAt: null,
        updatedAt: new Date().toISOString(),
      });

      resetForm();
    } catch (error) {
      Alert.alert(
        "Could not add train assignment",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSwapAssignmentMembers(assignmentId: string) {
    const assignment = trainAssignments.find(
      (item) => item.id === assignmentId,
    );

    if (!assignment) return;

    try {
      setWorkingAssignmentId(assignmentId);

      await updateTrainAssignment(assignmentId, {
        conductorMemberId: assignment.passengerMemberId ?? null,
        passengerMemberId: assignment.conductorMemberId ?? null,
      });
    } catch (error) {
      Alert.alert(
        "Could not swap assignment",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setWorkingAssignmentId(null);
    }
  }

  async function handleCompleteAssignment(assignmentId: string) {
    try {
      setWorkingAssignmentId(assignmentId);
      await completeTrainAssignment(assignmentId);
    } catch (error) {
      Alert.alert(
        "Could not complete assignment",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setWorkingAssignmentId(null);
    }
  }

  async function handleReopenAssignment(assignmentId: string) {
    try {
      setWorkingAssignmentId(assignmentId);
      await reopenTrainAssignment(assignmentId);
    } catch (error) {
      Alert.alert(
        "Could not reopen assignment",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setWorkingAssignmentId(null);
    }
  }

  function confirmDeleteAssignment(assignmentId: string) {
    Alert.alert(
      "Delete assignment?",
      "This will remove the train assignment from the board.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setWorkingAssignmentId(assignmentId);
              await deleteTrainAssignment(assignmentId);
            } catch (error) {
              Alert.alert(
                "Could not delete assignment",
                error instanceof Error
                  ? error.message
                  : "Something went wrong.",
              );
            } finally {
              setWorkingAssignmentId(null);
            }
          },
        },
      ],
    );
  }

  function renderAssignmentCard(
    assignment: TrainAssignment,
    variant: "active" | "completed",
  ) {
    const isCompleted = variant === "completed";
    const isWorking = workingAssignmentId === assignment.id;

    return (
      <View key={assignment.id} style={styles.assignmentCard}>
        <View style={styles.assignmentHeader}>
          <View style={styles.assignmentHeaderText}>
            <Text style={styles.assignmentTitle}>{assignment.trainName}</Text>
            <Text style={styles.assignmentDate}>{assignment.date}</Text>
          </View>

          <View
            style={isCompleted ? styles.completedBadge : styles.statusBadge}
          >
            <Text
              style={
                isCompleted ? styles.completedBadgeText : styles.statusBadgeText
              }
            >
              {isCompleted ? "Completed" : "Active"}
            </Text>
          </View>
        </View>

        <View style={styles.assignmentRow}>
          <Text style={styles.assignmentLabel}>Conductor</Text>
          <Text style={styles.assignmentValue}>
            {getMemberName(members, assignment.conductorMemberId)}
          </Text>
        </View>

        <View style={styles.assignmentRow}>
          <Text style={styles.assignmentLabel}>Passenger</Text>
          <Text style={styles.assignmentValue}>
            {getMemberName(members, assignment.passengerMemberId)}
          </Text>
        </View>

        {assignment.notes ? (
          <Text style={styles.assignmentNotes}>{assignment.notes}</Text>
        ) : null}

        <View style={styles.actionRow}>
          {!isCompleted ? (
            <>
              <Pressable
                style={[
                  styles.secondaryButton,
                  isWorking && styles.disabledButton,
                ]}
                onPress={() => handleSwapAssignmentMembers(assignment.id)}
                disabled={isWorking}
              >
                <Text style={styles.secondaryButtonText}>
                  {isWorking ? "Working..." : "Swap"}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.completeButton,
                  isWorking && styles.disabledButton,
                ]}
                onPress={() => handleCompleteAssignment(assignment.id)}
                disabled={isWorking}
              >
                <Text style={styles.completeButtonText}>Complete</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[
                styles.secondaryButton,
                isWorking && styles.disabledButton,
              ]}
              onPress={() => handleReopenAssignment(assignment.id)}
              disabled={isWorking}
            >
              <Text style={styles.secondaryButtonText}>
                {isWorking ? "Working..." : "Reopen"}
              </Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.deleteButton, isWorking && styles.disabledButton]}
            onPress={() => confirmDeleteAssignment(assignment.id)}
            disabled={isWorking}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <RequireActiveAlliance>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Alliance Trains</Text>
          <Text style={styles.title}>Train Board</Text>
          <Text style={styles.subtitle}>
            Assign conductors and passengers, then keep a history of completed
            train assignments.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>New Assignment</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={mutedColor}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!saving}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Train Name</Text>
            <TextInput
              value={trainName}
              onChangeText={setTrainName}
              placeholder="Mega Express, Gold Train, Regular Train..."
              placeholderTextColor={mutedColor}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!saving}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Conductor</Text>

            {activeMembers.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.memberPicker}
              >
                <Pressable
                  style={[
                    styles.memberChip,
                    conductorMemberId === null && styles.memberChipActive,
                  ]}
                  onPress={() => setConductorMemberId(null)}
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.memberChipText,
                      conductorMemberId === null && styles.memberChipTextActive,
                    ]}
                  >
                    Unassigned
                  </Text>
                </Pressable>

                {activeMembers.map((member) => {
                  const selected = conductorMemberId === member.id;

                  return (
                    <Pressable
                      key={member.id}
                      style={[
                        styles.memberChip,
                        selected && styles.memberChipActive,
                      ]}
                      onPress={() => setConductorMemberId(member.id)}
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
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>
                Add members before assigning conductors.
              </Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Passenger</Text>

            {activeMembers.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.memberPicker}
              >
                <Pressable
                  style={[
                    styles.memberChip,
                    passengerMemberId === null && styles.memberChipActive,
                  ]}
                  onPress={() => setPassengerMemberId(null)}
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.memberChipText,
                      passengerMemberId === null && styles.memberChipTextActive,
                    ]}
                  >
                    Unassigned
                  </Text>
                </Pressable>

                {activeMembers.map((member) => {
                  const selected = passengerMemberId === member.id;

                  return (
                    <Pressable
                      key={member.id}
                      style={[
                        styles.memberChip,
                        selected && styles.memberChipActive,
                      ]}
                      onPress={() => setPassengerMemberId(member.id)}
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
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>
                Add members before assigning passengers.
              </Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor={mutedColor}
              autoCapitalize="sentences"
              multiline
              editable={!saving}
              style={[styles.input, styles.notesInput]}
            />
          </View>

          <Pressable
            style={[styles.primaryButton, saving && styles.disabledButton]}
            onPress={handleAddAssignment}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? "Saving..." : "Add Assignment"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Assignments</Text>

          {activeAssignments.length > 0 ? (
            activeAssignments.map((assignment) =>
              renderAssignmentCard(assignment, "active"),
            )
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No active train assignments</Text>
              <Text style={styles.emptyText}>
                Add an assignment above to start building today&apos;s train
                board.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>

          {completedAssignments.length > 0 ? (
            completedAssignments.map((assignment) =>
              renderAssignmentCard(assignment, "completed"),
            )
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No train history yet</Text>
              <Text style={styles.emptyText}>
                Completed assignments will appear here.
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
    color: primaryColor,
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
    color: mutedColor,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 22,
    backgroundColor: surfaceColor,
    borderWidth: 1,
    borderColor,
    padding: 18,
    marginBottom: 24,
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
    borderColor,
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
  memberPicker: {
    paddingRight: 20,
  },
  memberChip: {
    minHeight: 38,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    marginRight: 8,
  },
  memberChipActive: {
    borderColor: primaryColor,
    backgroundColor: primaryColor,
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
    backgroundColor: primaryColor,
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.6,
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
  assignmentCard: {
    borderRadius: 20,
    backgroundColor: surfaceColor,
    borderWidth: 1,
    borderColor,
    padding: 16,
    marginBottom: 12,
  },
  assignmentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  assignmentHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  assignmentTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  assignmentDate: {
    color: mutedColor,
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
    color: primaryColor,
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
  assignmentRow: {
    marginBottom: 10,
  },
  assignmentLabel: {
    color: mutedColor,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  assignmentValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  assignmentNotes: {
    color: mutedColor,
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
    borderColor,
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
    backgroundColor: primaryColor,
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
    backgroundColor: surfaceColor,
    borderWidth: 1,
    borderColor,
    padding: 18,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyText: {
    color: mutedColor,
    fontSize: 14,
    lineHeight: 20,
  },
});
