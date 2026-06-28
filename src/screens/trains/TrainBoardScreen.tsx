import { FlatList, StyleSheet, Text, View } from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";
import { formatDateTime } from "../../utils/format";

export function TrainBoardScreen() {
  const trains = useAllianceStore((state) => state.trains);
  const members = useAllianceStore((state) => state.members);

  function getMemberName(memberId?: string) {
    if (!memberId) return "Unassigned";
    return (
      members.find((member) => member.id === memberId)?.username ?? "Unknown"
    );
  }

  return (
    <RequireActiveAlliance>
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
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  meta: {
    color: colors.muted,
    fontWeight: "600",
  },
  section: {
    gap: 3,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  value: {
    color: colors.text,
    fontWeight: "700",
  },
  notes: {
    color: colors.muted,
    lineHeight: 20,
    marginTop: 4,
  },
  empty: {
    color: colors.muted,
    lineHeight: 20,
  },
});
