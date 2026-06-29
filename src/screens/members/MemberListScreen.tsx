import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import {
  AllianceMember,
  formatAllianceRole,
  useAllianceStore,
} from "@/store/allianceStore";
import { colors } from "@/theme/colors";

type RouterTarget = Parameters<typeof router.push>[0];

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

export function formatCompactNumber(value: number | null | undefined) {
  const safeValue = Number(value ?? 0);

  if (!Number.isFinite(safeValue)) {
    return "0";
  }

  if (safeValue >= 1_000_000) {
    return `${(safeValue / 1_000_000).toFixed(1).replace(".0", "")}M`;
  }

  if (safeValue >= 1_000) {
    return `${(safeValue / 1_000).toFixed(1).replace(".0", "")}K`;
  }

  return safeValue.toString();
}

function getDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function getMemberName(member: AllianceMember) {
  return member.name?.trim() || "Unnamed Member";
}

export function MemberListScreen() {
  const activeAlliance = useAllianceStore((state) => state.activeAlliance);
  const members = useAllianceStore((state) => state.members ?? []);
  const dailyStats = useAllianceStore((state) => state.dailyStats ?? []);
  const loading = useAllianceStore((state) => state.loading);
  const error = useAllianceStore((state) => state.error);
  const loadActiveAlliance = useAllianceStore(
    (state) => state.loadActiveAlliance,
  );

  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const weekStart = getDateDaysAgo(6);

  const weeklyTotalsByMemberId = useMemo(() => {
    const totals = new Map<
      string,
      {
        donations: number;
        vsScore: number;
      }
    >();

    dailyStats
      .filter((stat) => stat.date >= weekStart && stat.date <= today)
      .forEach((stat) => {
        const existing = totals.get(stat.memberId) ?? {
          donations: 0,
          vsScore: 0,
        };

        totals.set(stat.memberId, {
          donations: existing.donations + Number(stat.donations ?? 0),
          vsScore: existing.vsScore + Number(stat.vsScore ?? 0),
        });
      });

    return totals;
  }, [dailyStats, today, weekStart]);

  const activeMembers = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    return members
      .filter((member) => member.isActive !== false)
      .filter((member) => {
        if (!normalizedSearchText) {
          return true;
        }

        return getMemberName(member)
          .toLowerCase()
          .includes(normalizedSearchText);
      })
      .slice()
      .sort((a, b) => getMemberName(a).localeCompare(getMemberName(b)));
  }, [members, searchText]);

  const inactiveMembers = useMemo(() => {
    return members
      .filter((member) => member.isActive === false)
      .slice()
      .sort((a, b) => getMemberName(a).localeCompare(getMemberName(b)));
  }, [members]);

  const totalPower = useMemo(() => {
    return members.reduce((sum, member) => {
      return sum + Number(member.power ?? 0);
    }, 0);
  }, [members]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await loadActiveAlliance();
    } catch (loadError) {
      console.error("MEMBER LIST REFRESH ERROR:", loadError);
    } finally {
      setRefreshing(false);
    }
  }

  function handleAddMember() {
    router.push("/members/create" as RouterTarget);
  }

  function handleOpenMember(memberId: string) {
    router.push(`/members/${memberId}` as RouterTarget);
  }

  function renderMemberCard(member: AllianceMember) {
    const weeklyTotals = weeklyTotalsByMemberId.get(member.id) ?? {
      donations: 0,
      vsScore: 0,
    };

    return (
      <Pressable
        key={member.id}
        style={styles.memberCard}
        onPress={() => handleOpenMember(member.id)}
      >
        <View style={styles.memberTopRow}>
          <View style={styles.memberMain}>
            <Text style={styles.memberName}>{getMemberName(member)}</Text>

            <Text style={styles.memberMeta}>
              {formatAllianceRole(member.role)} · Level {member.level ?? "—"}
            </Text>
          </View>

          <View style={styles.powerPill}>
            <Text style={styles.powerPillText}>
              {formatCompactNumber(Number(member.power ?? 0))}
            </Text>
          </View>
        </View>

        <View style={styles.memberStatsRow}>
          <View style={styles.memberStat}>
            <Text style={styles.memberStatLabel}>Weekly VS</Text>
            <Text style={styles.memberStatValue}>
              {formatCompactNumber(weeklyTotals.vsScore)}
            </Text>
          </View>

          <View style={styles.memberStat}>
            <Text style={styles.memberStatLabel}>Donations</Text>
            <Text style={styles.memberStatValue}>
              {formatCompactNumber(weeklyTotals.donations)}
            </Text>
          </View>
        </View>

        {member.notes ? <Text style={styles.notes}>{member.notes}</Text> : null}
      </Pressable>
    );
  }

  return (
    <RequireActiveAlliance>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Alliance Members</Text>
            <Text style={styles.title}>Roster</Text>
            <Text style={styles.subtitle}>
              {activeAlliance?.name
                ? `${activeAlliance.name} member management`
                : "Manage your alliance members"}
            </Text>
          </View>

          <Pressable style={styles.addButton} onPress={handleAddMember}>
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Members</Text>
            <Text style={styles.statValue}>{activeMembers.length}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Power</Text>
            <Text style={styles.statValue}>
              {formatCompactNumber(totalPower)}
            </Text>
          </View>
        </View>

        <View style={styles.searchCard}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search members"
            placeholderTextColor={mutedColor}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.searchInput}
          />
        </View>

        {loading && members.length === 0 ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Loading members...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Could not load members</Text>
            <Text style={styles.errorText}>{error}</Text>

            <Pressable
              style={styles.retryButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <Text style={styles.retryButtonText}>
                {refreshing ? "Refreshing..." : "Try Again"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active</Text>

            <Pressable
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <Text style={styles.refreshButtonText}>
                {refreshing ? "Refreshing..." : "Refresh"}
              </Text>
            </Pressable>
          </View>

          {activeMembers.length > 0 ? (
            activeMembers.map(renderMemberCard)
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No active members yet</Text>
              <Text style={styles.emptyText}>
                Tap Add to create your first alliance member.
              </Text>
            </View>
          )}
        </View>

        {inactiveMembers.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inactive</Text>
            {inactiveMembers.map(renderMemberCard)}
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
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
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
    marginBottom: 6,
  },
  subtitle: {
    color: mutedColor,
    fontSize: 15,
    lineHeight: 22,
  },
  addButton: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: primaryColor,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    minHeight: 94,
    borderRadius: 18,
    backgroundColor: surfaceColor,
    borderWidth: 1,
    borderColor,
    padding: 14,
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
  searchCard: {
    borderRadius: 18,
    backgroundColor: surfaceColor,
    borderWidth: 1,
    borderColor,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  searchInput: {
    minHeight: 48,
    color: colors.text,
    fontSize: 16,
  },
  loadingCard: {
    borderRadius: 18,
    backgroundColor: surfaceColor,
    borderWidth: 1,
    borderColor,
    padding: 16,
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  loadingText: {
    color: mutedColor,
    fontSize: 14,
    fontWeight: "700",
  },
  errorCard: {
    borderRadius: 18,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 16,
    marginBottom: 18,
    gap: 8,
  },
  errorTitle: {
    color: "#991b1b",
    fontSize: 16,
    fontWeight: "900",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: "flex-start",
    borderRadius: 12,
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "900",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  refreshButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  refreshButtonText: {
    color: mutedColor,
    fontSize: 12,
    fontWeight: "900",
  },
  memberCard: {
    borderRadius: 20,
    backgroundColor: surfaceColor,
    borderWidth: 1,
    borderColor,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  memberTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  memberMain: {
    flex: 1,
  },
  memberName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  memberMeta: {
    color: mutedColor,
    fontSize: 13,
    fontWeight: "800",
  },
  powerPill: {
    borderRadius: 999,
    backgroundColor: "#f8f5ff",
    borderWidth: 1,
    borderColor: "#d8d0ff",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  powerPillText: {
    color: primaryColor,
    fontSize: 13,
    fontWeight: "900",
  },
  memberStatsRow: {
    flexDirection: "row",
    gap: 10,
  },
  memberStat: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    padding: 12,
  },
  memberStatLabel: {
    color: mutedColor,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  memberStatValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  notes: {
    color: mutedColor,
    fontSize: 14,
    lineHeight: 20,
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
