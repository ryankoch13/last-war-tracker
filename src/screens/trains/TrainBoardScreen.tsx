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
import { useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

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

  const activeMembers = useMemo(() => {
    return members
      .filter((member) => member.isActive !== false)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  const activeAssignments = useMemo(() => {
    return trainAssignments
      .filter((assignment) => assignment.status !== "completed")
      .slice()
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);

        if (dateCompare !== 0) return dateCompare;

        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [trainAssignments]);

  const completedAssignments = useMemo(() => {
    return trainAssignments
      .filter((assignment) => assignment.status === "completed")
      .slice()
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);

        if (dateCompare !== 0) return dateCompare;

        return (b.completedAt ?? b.createdAt).localeCompare(
          a.completedAt ?? a.createdAt,
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

  function handleAddAssignment() {
    const trimmedTrainName = trainName.trim();

    if (!trimmedTrainName) {
      Alert.alert("Train name required", "Enter a train name or train type.");
      return;
    }

    addTrainAssignment({
      date: date.trim() || todayString(),
      trainName: trimmedTrainName,
      conductorMemberId,
      passengerMemberId,
      notes: notes.trim(),
      status: "active",
      completedAt: null,
      updatedAt: new Date().toISOString(),
    });

    resetForm();
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
          onPress: () => deleteTrainAssignment(assignmentId),
        },
      ],
    );
  }

  function swapAssignmentMembers(assignmentId: string) {
    const assignment = trainAssignments.find(
      (item) => item.id === assignmentId,
    );

    if (!assignment) return;

    updateTrainAssignment(assignmentId, {
      conductorMemberId: assignment.passengerMemberId ?? null,
      passengerMemberId: assignment.conductorMemberId ?? null,
    });
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
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Train Name</Text>
            <TextInput
              value={trainName}
              onChangeText={setTrainName}
              placeholder="Mega Express, Gold Train, Regular Train..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
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
              placeholderTextColor={colors.textMuted}
              autoCapitalize="sentences"
              multiline
              style={[styles.input, styles.notesInput]}
            />
          </View>

          <Pressable style={styles.primaryButton} onPress={handleAddAssignment}>
            <Text style={styles.primaryButtonText}>Add Assignment</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Assignments</Text>

          {activeAssignments.length > 0 ? (
            activeAssignments.map((assignment) => (
              <View key={assignment.id} style={styles.assignmentCard}>
                <View style={styles.assignmentHeader}>
                  <View style={styles.assignmentHeaderText}>
                    <Text style={styles.assignmentTitle}>
                      {assignment.trainName}
                    </Text>
                    <Text style={styles.assignmentDate}>{assignment.date}</Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Active</Text>
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
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => swapAssignmentMembers(assignment.id)}
                  >
                    <Text style={styles.secondaryButtonText}>Swap</Text>
                  </Pressable>

                  <Pressable
                    style={styles.completeButton}
                    onPress={() => completeTrainAssignment(assignment.id)}
                  >
                    <Text style={styles.completeButtonText}>Complete</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => confirmDeleteAssignment(assignment.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
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
            completedAssignments.map((assignment) => (
              <View key={assignment.id} style={styles.assignmentCard}>
                <View style={styles.assignmentHeader}>
                  <View style={styles.assignmentHeaderText}>
                    <Text style={styles.assignmentTitle}>
                      {assignment.trainName}
                    </Text>
                    <Text style={styles.assignmentDate}>{assignment.date}</Text>
                  </View>

                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>Completed</Text>
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
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => reopenTrainAssignment(assignment.id)}
                  >
                    <Text style={styles.secondaryButtonText}>Reopen</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => confirmDeleteAssignment(assignment.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
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
  assignmentCard: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
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
  assignmentRow: {
    marginBottom: 10,
  },
  assignmentLabel: {
    color: colors.textMuted,
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
