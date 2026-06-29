import { ScrollView, StyleSheet, Text, View } from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { useActiveAlliance } from "@/hooks/useActiveAlliance";
import { colors } from "@/theme/colors";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPower(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return String(value);
}

export function DashboardScreen() {
  const {
    activeAlliance,
    members = [],
    dailyStats = [],
    trainAssignments = [],
    events = [],
  } = useActiveAlliance();

  const today = new Date().toISOString().slice(0, 10);

  const activeMembers = members.filter((member) => member.isActive !== false);

  const totalPower = members.reduce((sum, member) => {
    return sum + Number(member.power ?? 0);
  }, 0);

  const todaysStats = dailyStats.filter((stat) => stat.date === today);

  const todaysDonations = todaysStats.reduce((sum, stat) => {
    return sum + Number(stat.donations ?? 0);
  }, 0);

  const todaysVersusPoints = todaysStats.reduce((sum, stat) => {
    return sum + Number(stat.versusPoints ?? 0);
  }, 0);

  const activeTrainAssignments = trainAssignments.filter((assignment) => {
    return assignment.status !== "completed";
  });

  const activeEvents = events.filter((event) => {
    return event.status !== "completed";
  });

  const topMembers = [...members]
    .sort((a, b) => Number(b.power ?? 0) - Number(a.power ?? 0))
    .slice(0, 3);

  return (
    <RequireActiveAlliance>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Alliance Dashboard</Text>
          <Text style={styles.title}>
            {activeAlliance?.name ?? "Your Alliance"}
          </Text>
          <Text style={styles.subtitle}>
            Track members, donations, VS points, trains, and events.
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Members</Text>
            <Text style={styles.statValue}>{activeMembers.length}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Power</Text>
            <Text style={styles.statValue}>{formatPower(totalPower)}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today&apos;s Donations</Text>
            <Text style={styles.statValue}>
              {formatNumber(todaysDonations)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today&apos;s VS</Text>
            <Text style={styles.statValue}>
              {formatNumber(todaysVersusPoints)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Activity</Text>

          <View style={styles.activityRow}>
            <View style={styles.activityCard}>
              <Text style={styles.activityValue}>
                {activeTrainAssignments.length}
              </Text>
              <Text style={styles.activityLabel}>Active Train Assignments</Text>
            </View>

            <View style={styles.activityCard}>
              <Text style={styles.activityValue}>{activeEvents.length}</Text>
              <Text style={styles.activityLabel}>Active Events</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Members</Text>

          {topMembers.length > 0 ? (
            topMembers.map((member, index) => (
              <View key={member.id} style={styles.memberRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>

                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberMeta}>
                    {member.role} · Level {member.level ?? "—"}
                  </Text>
                </View>

                <Text style={styles.memberPower}>
                  {formatPower(Number(member.power ?? 0))}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No members yet</Text>
              <Text style={styles.emptyText}>
                Add members to start tracking alliance stats.
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    minHeight: 104,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    padding: 16,
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  activityRow: {
    flexDirection: "row",
    gap: 12,
  },
  activityCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 16,
    justifyContent: "center",
  },
  activityValue: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
  },
  activityLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 14,
    marginBottom: 10,
  },
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  rankText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  memberMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  memberPower: {
    color: colors.text,
    fontSize: 15,
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
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
