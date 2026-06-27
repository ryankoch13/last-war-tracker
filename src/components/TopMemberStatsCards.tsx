import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAllianceStore } from "../store/allianceStore";
import type { StatMetric, StatRange } from "../types/alliance";
import { getTopMemberStats } from "../utils/statRanges";

const metricLabels: Record<StatMetric, string> = {
  weeklyVs: "Weekly VS",
  donations: "Donations",
};

const rangeLabels: Record<StatRange, string> = {
  week: "Week",
  month: "Month",
};

export function TopMemberStatsCard() {
  const [metric, setMetric] = useState<StatMetric>("weeklyVs");
  const [range, setRange] = useState<StatRange>("week");

  const members = useAllianceStore((state) => state.members);
  const dailyStats = useAllianceStore((state) => state.dailyStats);

  const data = useMemo(() => {
    return getTopMemberStats({
      members,
      dailyStats,
      metric,
      range,
      limit: 5,
    });
  }, [members, dailyStats, metric, range]);

  const maxTotal = Math.max(...data.map((item) => item.total), 1);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Top Contributors</Text>
          <Text style={styles.subtitle}>
            {metricLabels[metric]} · {rangeLabels[range]}
          </Text>
        </View>
      </View>

      <View style={styles.toggleRow}>
        <ToggleButton
          label="VS"
          active={metric === "weeklyVs"}
          onPress={() => setMetric("weeklyVs")}
        />
        <ToggleButton
          label="Donations"
          active={metric === "donations"}
          onPress={() => setMetric("donations")}
        />
      </View>

      <View style={styles.toggleRow}>
        <ToggleButton
          label="Weekly"
          active={range === "week"}
          onPress={() => setRange("week")}
        />
        <ToggleButton
          label="Monthly"
          active={range === "month"}
          onPress={() => setRange("month")}
        />
      </View>

      <View style={styles.chart}>
        {data.length === 0 ? (
          <Text style={styles.emptyText}>
            No stats recorded for this range.
          </Text>
        ) : (
          data.map((item, index) => {
            const widthPercentage = `${Math.max(
              6,
              (item.total / maxTotal) * 100,
            )}%`;

            return (
              <View key={item.memberId} style={styles.barRow}>
                <View style={styles.rankCircle}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>

                <View style={styles.barContent}>
                  <View style={styles.barHeader}>
                    <Text style={styles.memberName}>{item.memberName}</Text>
                    <Text style={styles.totalText}>
                      {item.total.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.barTrack}>
                    <View
                      style={[styles.barFill, { width: widthPercentage }]}
                    />
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

function ToggleButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.toggleButton,
        active && styles.toggleButtonActive,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.toggleButtonText,
          active && styles.toggleButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  toggleButtonActive: {
    backgroundColor: "#4f46e5",
  },
  toggleButtonText: {
    color: "#4b5563",
    fontWeight: "700",
  },
  toggleButtonTextActive: {
    color: "#fff",
  },
  chart: {
    marginTop: 8,
    gap: 14,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    color: "#4f46e5",
    fontWeight: "800",
  },
  barContent: {
    flex: 1,
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 12,
  },
  memberName: {
    color: "#111827",
    fontWeight: "700",
  },
  totalText: {
    color: "#4b5563",
    fontWeight: "600",
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#4f46e5",
  },
  emptyText: {
    color: "#6b7280",
  },
  pressed: {
    opacity: 0.7,
  },
});
