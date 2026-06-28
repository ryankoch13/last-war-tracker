import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { getAllianceEvents } from "@/lib/allianceEvents";
import { getTrainAssignments } from "@/lib/trainAssignments";
import { getAllianceMembers } from "@/services/allianceMembers";
import { StatCard } from "../components/StatCard";
import { useAllianceStore } from "../store/allianceStore";
import { colors } from "../theme/colors";
import { formatCompactNumber, formatDateTime } from "../utils/format";

type DashboardMember = {
  id: string;
  username?: string;
  name?: string;
  power: number;
  weeklyVsScore: number;
  weeklyDonations: number;
};

type DashboardEvent = {
  id: string;
  title: string;
  type: string;
  startsAt: string;
};

type DashboardTrain = {
  id: string;
  trainName: string;
  departureTime: string;
  guardIds: string[];
  passengerIds: string[];
};

export function DashboardScreen() {
  const alliance = useAllianceStore((state) => state.alliance);
  const activeAllianceId = alliance?.id ?? null;

  const [members, setMembers] = useState<DashboardMember[]>([]);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [trains, setTrains] = useState<DashboardTrain[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!activeAllianceId) {
      return;
    }

    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [loadedMembers, loadedEvents, loadedTrains] = await Promise.all([
          getAllianceMembers(activeAllianceId),
          getAllianceEvents(activeAllianceId),
          getTrainAssignments(activeAllianceId),
        ]);

        if (!isMounted) {
          return;
        }

        setMembers(loadedMembers ?? []);
        setEvents(loadedEvents ?? []);
        setTrains(loadedTrains ?? []);
      } catch (error) {
        console.error("DASHBOARD LOAD ERROR:", error);

        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load dashboard data.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [activeAllianceId]);

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
    <RequireActiveAlliance>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View>
          <Text style={styles.title}>Alliance Ops</Text>
          <Text style={styles.subtitle}>
            Roster, train, and event management for strategy game alliances.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingPanel}>
            <ActivityIndicator />
            <Text style={styles.emptyText}>Loading dashboard...</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.panel}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.grid}>
          <StatCard label="Members" value={members.length} />
          <StatCard
            label="Total Power"
            value={formatCompactNumber(totalPower)}
          />
        </View>

        <View style={styles.grid}>
          <StatCard
            label="Top VS"
            value={topVsMember?.username ?? topVsMember?.name ?? "—"}
            helper={
              topVsMember
                ? formatCompactNumber(topVsMember.weeklyVsScore)
                : "No VS data yet"
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
    </RequireActiveAlliance>
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
  loadingPanel: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
    alignItems: "center",
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
  errorText: {
    color: "#DC2626",
    fontWeight: "700",
  },
});
