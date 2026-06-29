import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { router } from "expo-router";
import { useState } from "react";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";
import type { AllianceMember, TrainAssignment } from "../../types/alliance";

type PickerMode = "conductor" | "guards" | "passengers";

type PickerState = {
  trainId: string;
  mode: PickerMode;
} | null;

function getMemberName(members: AllianceMember[], memberId?: string) {
  if (!memberId) return "Unassigned";
  return (
    members.find((member) => member.id === memberId)?.username ?? "Unknown"
  );
}

function getMemberNames(members: AllianceMember[], memberIds: string[]) {
  if (memberIds.length === 0) return "None assigned";

  return memberIds
    .map((memberId) => getMemberName(members, memberId))
    .join(", ");
}

function getPickerTitle(mode: PickerMode) {
  switch (mode) {
    case "conductor":
      return "Set Conductor";
    case "guards":
      return "Edit Guards";
    case "passengers":
      return "Edit Passengers";
  }
}

export function TrainBoardScreen() {
  const [pickerState, setPickerState] = useState<PickerState>(null);

  const members = useAllianceStore((state) => state.members);
  const trains = useAllianceStore((state) => state.trains);

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

  const activeTrains = useMemo(() => {
    return trains
      .filter((train) => train.status !== "completed")
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [trains]);

  const completedTrains = useMemo(() => {
    return trains
      .filter((train) => train.status === "completed")
      .slice()
      .sort((a, b) => {
        const aDate = a.completedAt ?? a.date;
        const bDate = b.completedAt ?? b.date;
        return bDate.localeCompare(aDate);
      });
  }, [trains]);

  const selectedTrain = useMemo(() => {
    if (!pickerState) return undefined;
    return trains.find((train) => train.id === pickerState.trainId);
  }, [pickerState, trains]);

  function confirmCompleteTrain(train: TrainAssignment) {
    Alert.alert(
      "Complete train?",
      "This will move this assignment to train history.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Complete",
          onPress: () => completeTrainAssignment(train.id),
        },
      ],
    );
  }

  function confirmDeleteTrain(train: TrainAssignment) {
    Alert.alert(
      "Delete train?",
      "This will permanently delete this train assignment.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTrainAssignment(train.id),
        },
      ],
    );
  }

  function toggleMember(memberId: string) {
    if (!pickerState || !selectedTrain) return;

    if (pickerState.mode === "conductor") {
      updateTrainAssignment(selectedTrain.id, {
        conductorId:
          selectedTrain.conductorId === memberId ? undefined : memberId,
      });
      setPickerState(null);
      return;
    }

    if (pickerState.mode === "guards") {
      const isSelected = selectedTrain.guardIds.includes(memberId);

      updateTrainAssignment(selectedTrain.id, {
        guardIds: isSelected
          ? selectedTrain.guardIds.filter((id) => id !== memberId)
          : [...selectedTrain.guardIds, memberId],
      });

      return;
    }

    const isSelected = selectedTrain.passengerIds.includes(memberId);

    updateTrainAssignment(selectedTrain.id, {
      passengerIds: isSelected
        ? selectedTrain.passengerIds.filter((id) => id !== memberId)
        : [...selectedTrain.passengerIds, memberId],
    });
  }

  function isMemberSelected(memberId: string) {
    if (!pickerState || !selectedTrain) return false;

    if (pickerState.mode === "conductor") {
      return selectedTrain.conductorId === memberId;
    }

    if (pickerState.mode === "guards") {
      return selectedTrain.guardIds.includes(memberId);
    }

    return selectedTrain.passengerIds.includes(memberId);
  }

  return (
    <RequireActiveAlliance>
      <Pressable
        onPress={() => router.push("/trains/create")}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>+ Create Train</Text>
      </Pressable>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={trains}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No trains yet. This will become your alliance train assignment
            board.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.trainName}</Text>
            <Text style={styles.meta}>
              Departure: {formatDateTime(item.departureTime)}
            </Text>

            <View style={styles.section}>
              <Text style={styles.label}>Conductor</Text>
              <Text style={styles.value}>
                {getMemberName(item.conductorId)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Guards</Text>
              <Text style={styles.value}>
                {item.guardIds.length
                  ? item.guardIds.map(getMemberName).join(", ")
                  : "None assigned"}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Passengers</Text>
              <Text style={styles.value}>
                {item.passengerIds.length
                  ? item.passengerIds.map(getMemberName).join(", ")
                  : "None assigned"}
              </Text>
            </View>

            {!!item.notes && <Text style={styles.notes}>{item.notes}</Text>}
          </View>
        )}
      />
    </RequireActiveAlliance>
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
  assignmentBlock: {
    gap: 10,
  },
  assignmentLine: {
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  assignmentLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  assignmentValue: {
    color: colors.text,
    fontWeight: "800",
  },
  assignmentEdit: {
    color: colors.primary,
    fontWeight: "800",
    alignSelf: "center",
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
  },
  completeButton: {
    backgroundColor: colors.primary,
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
  reopenButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reopenButtonText: {
    color: colors.text,
    fontWeight: "900",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  deleteButtonText: {
    color: "#b91c1c",
    fontWeight: "900",
  },
  historyDetails: {
    gap: 5,
  },
  historyText: {
    color: colors.muted,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "82%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    gap: 12,
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
  createButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
