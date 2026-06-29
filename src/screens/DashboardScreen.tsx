import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { BoardItemStatus, useAllianceStore } from "@/store/allianceStore";
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

function getDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRole(role: string | null | undefined) {
  return role ? role.toUpperCase() : "R1";
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {helper ? <Text style={styles.statHelper}>{helper}</Text> : null}
    </View>
  );
}

export function DashboardScreen() {
  const activeAlliance = useAllianceStore((state) => state.activeAlliance);
  const members = useAllianceStore((state) => state.members ?? []);
  const dailyStats = useAllianceStore((state) => state.dailyStats ?? []);
  const trainAssignments = useAllianceStore(
    (state) => state.trainAssignments ?? [],
  );
  const events = useAllianceStore((state) => state.events ?? []);

  const today = todayString();
  const weekStart = getDateDaysAgo(6);

  const activeMembers = useMemo(() => {
    return members.filter((member) => member.isActive !== false);
  }, [members]);

  const totalPower = useMemo(() => {
    return members.reduce((sum, member) => {
      return sum + Number(member.power ?? 0);
    }, 0);
  }, [members]);

  const todaysStats = useMemo(() => {
    return dailyStats.filter((stat) => stat.date === today);
  }, [dailyStats, today]);

  const weekStats = useMemo(() => {
    return dailyStats.filter((stat) => {
      return stat.date >= weekStart && stat.date <= today;
    });
  }, [dailyStats, today, weekStart]);

  const todaysDonations = useMemo(() => {
    return todaysStats.reduce((sum, stat) => {
      return sum + Number(stat.donations ?? 0);
    }, 0);
  }, [todaysStats]);

  const todaysVersusPoints = useMemo(() => {
    return todaysStats.reduce((sum, stat) => {
      return sum + Number(stat.versusPoints ?? 0);
    }, 0);
  }, [todaysStats]);

  const weeklyDonations = useMemo(() => {
    return weekStats.reduce((sum, stat) => {
      return sum + Number(stat.donations ?? 0);
    }, 0);
  }, [weekStats]);

  const weeklyVersusPoints = useMemo(() => {
    return weekStats.reduce((sum, stat) => {
      return sum + Number(stat.versusPoints ?? 0);
    }, 0);
  }, [weekStats]);

  const memberWeeklyTotals = useMemo(() => {
    const totals = new Map<
      string,
      {
        donations: number;
        versusPoints: number;
      }
    >();

    weekStats.forEach((stat) => {
      const existing = totals.get(stat.memberId) ?? {
        donations: 0,
        versusPoints: 0,
      };

      totals.set(stat.memberId, {
        donations: existing.donations + Number(stat.donations ?? 0),
        versusPoints: existing.versusPoints + Number(stat.versusPoints ?? 0),
      });
    });

    return totals;
  }, [weekStats]);

  const topVsMember = useMemo(() => {
    return activeMembers.slice().sort((a, b) => {
      const aTotal = memberWeeklyTotals.get(a.id)?.versusPoints ?? 0;
      const bTotal = memberWeeklyTotals.get(b.id)?.versusPoints ?? 0;

      return bTotal - aTotal;
    })[0];
  }, [activeMembers, memberWeeklyTotals]);

  const topVsTotal = topVsMember
    ? (memberWeeklyTotals.get(topVsMember.id)?.versusPoints ?? 0)
    : 0;

  const lowDonationMembers = useMemo(() => {
    return activeMembers.filter((member) => {
      const donations = memberWeeklyTotals.get(member.id)?.donations ?? 0;

      return donations < 30_000;
    });
  }, [activeMembers, memberWeeklyTotals]);

  const activeTrainAssignments = useMemo(() => {
    return trainAssignments
      .filter((assignment) => assignment.status !== BoardItemStatus.Completed)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [trainAssignments]);

  const activeEvents = useMemo(() => {
    return events
      .filter((event) => event.status !== BoardItemStatus.Completed)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  const nextEvent = useMemo(() => {
    return (
      activeEvents.find((event) => event.date >= today) ??
      activeEvents[0] ??
      null
    );
  }, [activeEvents, today]);

  const topMembers = useMemo(() => {
    return activeMembers
      .slice()
      .sort((a, b) => Number(b.power ?? 0) - Number(a.power ?? 0))
      .slice(0, 3);
  }, [activeMembers]);

  return (
    <RequireActiveAlliance>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Alliance Dashboard</Text>
          <Text style={styles.title}>
            {activeAlliance?.name ?? "Alliance Ops"}
          </Text>
          <Text style={styles.subtitle}>
            Roster, stats, train, and event management for your alliance.
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Members" value={activeMembers.length} />
          <StatCard
            label="Total Power"
            value={formatCompactNumber(totalPower)}
          />
          <StatCard
            label="Today's Donations"
            value={formatCompactNumber(todaysDonations)}
            helper={`${formatCompactNumber(weeklyDonations)} this week`}
          />
          <StatCard
            label="Today's VS"
            value={formatCompactNumber(todaysVersusPoints)}
            helper={`${formatCompactNumber(weeklyVersusPoints)} this week`}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            label="Top VS"
            value={topVsMember?.name ?? "—"}
            helper={
              topVsMember
                ? `${formatCompactNumber(topVsTotal)} this week`
                : "No VS data yet"
            }
          />

          <StatCard
            label="Low Donations"
            value={lowDonationMembers.length}
            helper="Under 30k this week"
          />

          <StatCard
            label="Active Trains"
            value={activeTrainAssignments.length}
          />

          <StatCard label="Active Events" value={activeEvents.length} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Event</Text>

          {nextEvent ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>{nextEvent.name}</Text>
              <Text style={styles.panelText}>
                {nextEvent.type} · {nextEvent.date}
              </Text>
              {nextEvent.notes ? (
                <Text style={styles.panelText}>{nextEvent.notes}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No upcoming events</Text>
              <Text style={styles.emptyText}>
                Add an event from the Events tab to see it here.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Train Snapshot</Text>

          {activeTrainAssignments.length > 0 ? (
            activeTrainAssignments.slice(0, 3).map((assignment) => (
              <View key={assignment.id} style={styles.panel}>
                <Text style={styles.panelTitle}>{assignment.trainName}</Text>
                <Text style={styles.panelText}>{assignment.date}</Text>
                <Text style={styles.panelText}>
                  Assigned:{" "}
                  {
                    [
                      assignment.conductorMemberId,
                      assignment.passengerMemberId,
                    ].filter(Boolean).length
                  }
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No active train assignments</Text>
              <Text style={styles.emptyText}>
                Add train assignments from the Trains tab to see them here.
              </Text>
            </View>
          )}
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
                    {formatRole(member.role)} · Level {member.level ?? "—"}
                  </Text>
                </View>

                <Text style={styles.memberPower}>
                  {formatCompactNumber(Number(member.power ?? 0))}
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

        {lowDonationMembers.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Donation Watch</Text>

            {lowDonationMembers.slice(0, 5).map((member) => {
              const donations =
                memberWeeklyTotals.get(member.id)?.donations ?? 0;

              return (
                <View key={member.id} style={styles.memberRow}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberMeta}>
                      {formatNumber(donations)} donations this week
                    </Text>
                  </View>

                  <Text style={styles.warningText}>Under 30k</Text>
                </View>
              );
            })}
          </View>
        ) : null}
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    width: "48%",
    minHeight: 104,
    borderRadius: 20,
    backgroundColor: surfaceColor,
    borderWidth: 1,
    borderColor,
    padding: 16,
    justifyContent: "space-between",
  },
  statLabel: {
    color: mutedColor,
    fontSize: 13,
    fontWeight: "800",
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  statHelper: {
    color: mutedColor,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
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
  panel: {
    borderRadius: 18,
    backgroundColor: surfaceColor,
    borderWidth: 1,
    borderColor,
    padding: 16,
    marginBottom: 10,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
  },
  panelText: {
    color: mutedColor,
    fontSize: 14,
    lineHeight: 20,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: surfaceColor,
    borderWidth: 1,
    borderColor,
    padding: 14,
    marginBottom: 10,
  },
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: primaryColor,
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
    fontWeight: "900",
    marginBottom: 2,
  },
  memberMeta: {
    color: mutedColor,
    fontSize: 13,
    fontWeight: "700",
  },
  memberPower: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  warningText: {
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
