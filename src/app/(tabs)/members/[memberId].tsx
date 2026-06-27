import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useAllianceStore } from "../../../store/allianceStore";
import { getTodayDateKey } from "../../../utils/statRanges";

function toNumber(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function MemberDetailScreen() {
  const { memberId } = useLocalSearchParams<{ memberId: string }>();

  const [selectedDate] = useState(getTodayDateKey());

  const member = useAllianceStore((state) =>
    state.members.find((item) => item.id === memberId),
  );

  const dailyStats = useAllianceStore((state) =>
    state.dailyStats
      .filter((stat) => stat.memberId === memberId)
      .sort((a, b) => b.date.localeCompare(a.date)),
  );

  const upsertDailyStat = useAllianceStore((state) => state.upsertDailyStat);

  const selectedStat = useMemo(() => {
    return dailyStats.find((stat) => stat.date === selectedDate);
  }, [dailyStats, selectedDate]);

  if (!member || !memberId) {
    return (
      <View style={styles.container}>
        <Text>Member not found.</Text>
      </View>
    );
  }

  const weeklyVs = selectedStat?.weeklyVs ?? 0;
  const donations = selectedStat?.donations ?? 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{member.name}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today</Text>
        <Text style={styles.dateText}>{selectedDate}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Weekly VS</Text>
          <TextInput
            value={String(weeklyVs)}
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(text) =>
              upsertDailyStat(memberId, selectedDate, {
                weeklyVs: toNumber(text),
              })
            }
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Donations</Text>
          <TextInput
            value={String(donations)}
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(text) =>
              upsertDailyStat(memberId, selectedDate, {
                donations: toNumber(text),
              })
            }
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>History</Text>

      <FlatList
        data={dailyStats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.historyRow}>
            <View>
              <Text style={styles.historyDate}>{item.date}</Text>
              <Text style={styles.historyText}>
                VS: {item.weeklyVs.toLocaleString()}
              </Text>
              <Text style={styles.historyText}>
                Donations: {item.donations.toLocaleString()}
              </Text>
            </View>

            <Pressable
              style={styles.editButton}
              onPress={() => {
                // Later, you could open a modal here to edit this specific date.
              }}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No daily stats recorded yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f8",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  dateText: {
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 16,
  },
  field: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 32,
  },
  historyRow: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  historyText: {
    color: "#4b5563",
    marginTop: 2,
  },
  editButton: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#eef2ff",
  },
  editButtonText: {
    color: "#4f46e5",
    fontWeight: "700",
  },
  emptyText: {
    color: "#6b7280",
  },
});
