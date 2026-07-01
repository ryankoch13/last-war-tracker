import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { useCanManageAlliance } from "@/hooks/useActiveAlliance";
import { AppButton } from "../../components/AppButton";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";

const EDIT_MEMBER_ROUTE = "/(tabs)/members/edit" as const;
const MEMBER_STATS_ROUTE = "/(tabs)/members/stats" as const;
const ADD_DAILY_STATS_ROUTE = "/(tabs)/members/add-daily-stats" as const;

export function MemberDetailsScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    memberId?: string | string[];
  }>();

  const memberId = Array.isArray(params.memberId)
    ? params.memberId[0]
    : params.memberId;

  const members = useAllianceStore((state) => state.members ?? []);
  const dailyStats = useAllianceStore((state) => state.dailyStats ?? []);
  const allianceUser = useAllianceStore((state) => state.allianceUser);
  const deleteMember = useAllianceStore((state) => state.deleteMember);

  const canManageAlliance = useCanManageAlliance();

  const member = useMemo(() => {
    if (!memberId) return undefined;

    return members.find((item) => item.id === memberId);
  }, [members, memberId]);

  const isOwnMember = Boolean(
    member?.userId &&
    allianceUser?.userId &&
    member.userId === allianceUser.userId,
  );

  const canUpdateThisMemberStats = canManageAlliance || isOwnMember;

  const memberDailyStats = useMemo(() => {
    if (!memberId) return [];

    return dailyStats
      .filter((stat) => getStatMemberId(stat) === memberId)
      .slice()
      .sort((a, b) => getStatDate(b).localeCompare(getStatDate(a)));
  }, [dailyStats, memberId]);

  const weeklyStats = useMemo(() => {
    const { startDate, endDate } = getCurrentWeekRange();

    return memberDailyStats.reduce(
      (totals, stat) => {
        const date = getStatDate(stat);

        if (date < startDate || date > endDate) {
          return totals;
        }

        return {
          vsScore: totals.vsScore + getStatVsScore(stat),
          donations: totals.donations + getStatDonations(stat),
        };
      },
      {
        vsScore: 0,
        donations: 0,
      },
    );
  }, [memberDailyStats]);

  const monthlyStats = useMemo(() => {
    const { startDate, endDate } = getCurrentMonthRange();

    return memberDailyStats.reduce(
      (totals, stat) => {
        const date = getStatDate(stat);

        if (date < startDate || date > endDate) {
          return totals;
        }

        return {
          vsScore: totals.vsScore + getStatVsScore(stat),
          donations: totals.donations + getStatDonations(stat),
        };
      },
      {
        vsScore: 0,
        donations: 0,
      },
    );
  }, [memberDailyStats]);

  const recentStats = useMemo(() => {
    return memberDailyStats.slice(0, 7);
  }, [memberDailyStats]);

  function goToEditMember() {
    if (!memberId) return;

    if (!canManageAlliance && !isOwnMember) {
      Alert.alert(
        "Permission required",
        "You can only update your own member info.",
      );
      return;
    }

    router.push({
      pathname: EDIT_MEMBER_ROUTE,
      params: {
        memberId,
      },
    });
  }

  function goToStats() {
    if (!memberId) return;

    router.push({
      pathname: MEMBER_STATS_ROUTE,
      params: {
        memberId,
      },
    });
  }

  function goToAddDailyStats(date?: string) {
    if (!memberId) return;

    if (!canUpdateThisMemberStats) {
      Alert.alert(
        "Permission required",
        "You can only update your own VS score and donations.",
      );
      return;
    }

    router.push({
      pathname: ADD_DAILY_STATS_ROUTE,
      params: {
        memberId,
        ...(date ? { date } : {}),
      },
    });
  }

  function confirmDeleteMember() {
    if (!member) return;

    if (!canManageAlliance) {
      Alert.alert(
        "Permission required",
        "Only R4 and R5 members can delete alliance members.",
      );
      return;
    }

    Alert.alert(
      "Delete member?",
      `This will remove ${member.name} from your alliance tracker.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMember(member.id);
              router.back();
            } catch (error) {
              console.error("DELETE MEMBER ERROR", error);
              Alert.alert("Error", "Could not delete member.");
            }
          },
        },
      ],
    );
  }

  if (!memberId || !member) {
    return (
      <RequireActiveAlliance>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Member not found</Text>
          <Text style={styles.emptyText}>
            This member could not be loaded. They may have been deleted, or the
            route may be missing a memberId.
          </Text>

          <AppButton title="Go Back" onPress={() => router.back()} />
        </View>
      </RequireActiveAlliance>
    );
  }

  return (
    <RequireActiveAlliance>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.eyebrow}>Alliance Member</Text>
              <Text style={styles.title}>{member.name}</Text>
            </View>

            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {member.role.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.memberMetaGrid}>
            <MetaItem label="Power" value={formatNumber(member.power)} />
            <MetaItem
              label="HQ Level"
              value={member.level ? `HQ ${member.level}` : "Not set"}
            />
          </View>

          {member.notes ? (
            <View style={styles.notesCard}>
              <Text style={styles.notesLabel}>R4 Notes</Text>
              <Text style={styles.notesText}>{member.notes}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            label="Weekly VS"
            value={formatNumber(weeklyStats.vsScore)}
          />
          <SummaryCard
            label="Weekly Donations"
            value={formatNumber(weeklyStats.donations)}
          />
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            label="Monthly VS"
            value={formatNumber(monthlyStats.vsScore)}
          />
          <SummaryCard
            label="Monthly Donations"
            value={formatNumber(monthlyStats.donations)}
          />
        </View>

        <View style={styles.actionsCard}>
          {canUpdateThisMemberStats ? (
            <AppButton
              title="Add Daily Stats"
              onPress={() => goToAddDailyStats()}
            />
          ) : null}

          <AppButton title="View Stats" onPress={goToStats} />

          {canManageAlliance ? (
            <AppButton title="Edit Member" onPress={goToEditMember} />
          ) : isOwnMember ? (
            <AppButton title="Update My Info" onPress={goToEditMember} />
          ) : null}
        </View>

        {!canManageAlliance && !isOwnMember ? (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>View-only member</Text>
            <Text style={styles.permissionText}>
              You can view this member&apos;s stats, but only R4/R5 members or
              the linked member can update this profile.
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Daily Stats</Text>

            <Pressable onPress={goToStats}>
              <Text style={styles.inlineAction}>View All</Text>
            </Pressable>
          </View>

          {recentStats.length > 0 ? (
            <View style={styles.statsList}>
              {recentStats.map((stat) => {
                const date = getStatDate(stat);

                return (
                  <Pressable
                    key={stat.id}
                    style={styles.statRow}
                    onPress={() => goToAddDailyStats(date)}
                  >
                    <View>
                      <Text style={styles.statDate}>
                        {formatLongDate(date)}
                      </Text>
                      <Text style={styles.statDateSub}>{date}</Text>
                    </View>

                    <View style={styles.statValues}>
                      <Text style={styles.statValue}>
                        VS: {formatNumber(getStatVsScore(stat))}
                      </Text>
                      <Text style={styles.statValue}>
                        Don: {formatNumber(getStatDonations(stat))}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardTitle}>No stats yet</Text>
              <Text style={styles.emptyCardText}>
                {canUpdateThisMemberStats
                  ? "Add this member's daily VS score and donations to start tracking progress."
                  : "Daily stats will appear here once they are added."}
              </Text>

              {canUpdateThisMemberStats ? (
                <Pressable
                  style={styles.emptyAction}
                  onPress={() => goToAddDailyStats()}
                >
                  <Text style={styles.emptyActionText}>Add Daily Stats</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>

        {canManageAlliance ? (
          <Pressable style={styles.deleteButton} onPress={confirmDeleteMember}>
            <Text style={styles.deleteButtonText}>Delete Member</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </RequireActiveAlliance>
  );
}

export default MemberDetailsScreen;

type MetaItemProps = {
  label: string;
  value: string;
};

function MetaItem({ label, value }: MetaItemProps) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function getStatMemberId(stat: any) {
  return stat.memberId ?? stat.member_id;
}

function getStatDate(stat: any) {
  return stat.date ?? "";
}

function getStatVsScore(stat: any) {
  return Number(stat.vsScore ?? stat.vs_score ?? stat.versus_points ?? 0);
}

function getStatDonations(stat: any) {
  return Number(stat.donations ?? 0);
}

function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;

  const start = new Date(now);
  start.setDate(now.getDate() - daysSinceMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    startDate: toDateKey(start),
    endDate: toDateKey(end),
  };
}

function getCurrentMonthRange() {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDate: toDateKey(start),
    endDate: toDateKey(end),
  };
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatLongDate(dateKey: string) {
  const date = parseDateKey(dateKey);

  if (!date) return dateKey;

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatNumber(value: number | null | undefined) {
  return Math.round(value ?? 0).toLocaleString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTextGroup: {
    flex: 1,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  roleBadge: {
    backgroundColor: colors.background,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  roleBadgeText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  memberMetaGrid: {
    flexDirection: "row",
    gap: 10,
  },
  metaItem: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 5,
  },
  notesCard: {
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  notesLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  notesText: {
    color: colors.text,
    lineHeight: 20,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 6,
  },
  actionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  permissionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 5,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  permissionText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  inlineAction: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  statsList: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  statRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  statDate: {
    color: colors.text,
    fontWeight: "900",
  },
  statDateSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  statValues: {
    alignItems: "flex-end",
    gap: 3,
  },
  statValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  emptyCardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyCardText: {
    color: colors.muted,
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: 6,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: "center",
  },
  emptyActionText: {
    color: colors.text,
    fontWeight: "900",
  },
  deleteButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  deleteButtonText: {
    color: colors.muted,
    fontWeight: "900",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: "center",
    gap: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
});
