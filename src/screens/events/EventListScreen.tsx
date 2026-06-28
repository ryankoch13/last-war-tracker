import { FlatList, StyleSheet, Text, View } from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";
import { formatDateTime } from "../../utils/format";

export function EventListScreen() {
  const events = useAllianceStore((state) => state.events);

  return (
    <RequireActiveAlliance>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={events}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No events yet. This screen will eventually handle Desert Storm,
            Alliance Duel, Capital War, and custom reminders.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.type}</Text>
            <Text style={styles.meta}>
              Starts {formatDateTime(item.startsAt)}
            </Text>
            {!!item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}
            <Text style={styles.assigned}>
              Assigned members: {item.assignedMemberIds.length}
            </Text>
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
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  meta: {
    color: colors.muted,
    fontWeight: "600",
  },
  description: {
    color: colors.text,
    lineHeight: 20,
    marginTop: 6,
  },
  assigned: {
    color: colors.primaryDark,
    fontWeight: "800",
    marginTop: 8,
  },
  empty: {
    color: colors.muted,
    lineHeight: 20,
  },
});
