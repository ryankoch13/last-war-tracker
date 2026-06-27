import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { TopMemberStatsCard } from "@/components/TopMemberStatsCards";
import { StatCard } from "../components/StatCard";
import { useAllianceStore } from "../store/allianceStore";
import { colors } from "../theme/colors";
import { formatCompactNumber, formatDateTime } from "../utils/format";

export function DashboardScreen() {
  const members = useAllianceStore((state) => state.members);
  const events = useAllianceStore((state) => state.events);
  const trains = useAllianceStore((state) => state.trains);
  const topVsMember = useMemo(() => {
    return [...members].sort((a, b) => b.weeklyVsScore - a.weeklyVsScore)[0];
  }, [members]);

  const lowDonationMembers = useMemo(() => {
    return members.filter((member) => member.weeklyDonations < 30000);
  }, [members]);

  const nextEvent = useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )[0];
  }, [events]);

  const totalPower = members.reduce((sum, member) => sum + member.power, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.title}>Alliance Ops</Text>
        <Text style={styles.subtitle}>
          Roster, train, and event management for strategy game alliances.
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <TopMemberStatsCard />
      </ScrollView>
      <View style={styles.grid}>
        <StatCard
          label="Top VS"
          value={topVsMember?.username ?? "—"}
          helper={
            topVsMember
              ? formatCompactNumber(topVsMember.weeklyVsScore)
              : "Load demo data"
          }
        />
        <StatCard
          label="Low Donations"
          value={lowDonationMembers.length}
          helper="Under 30k this week"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Event</Text>

        {nextEvent ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{nextEvent.title}</Text>
            <Text style={styles.panelText}>{nextEvent.type}</Text>
            <Text style={styles.panelText}>
              Starts {formatDateTime(nextEvent.startsAt)}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No upcoming events yet.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Train Snapshot</Text>

        {trains.length > 0 ? (
          trains.map((train) => (
            <View key={train.id} style={styles.panel}>
              <Text style={styles.panelTitle}>{train.trainName}</Text>
              <Text style={styles.panelText}>
                Departure: {formatDateTime(train.departureTime)}
              </Text>
              <Text style={styles.panelText}>
                Assigned: {train.guardIds.length + train.passengerIds.length}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No train assignments yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 18,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    marginTop: 6,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 4,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  panelText: {
    color: colors.muted,
  },
  emptyText: {
    color: colors.muted,
  },
});
