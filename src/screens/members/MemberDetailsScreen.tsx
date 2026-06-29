import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { AppButton } from "../../components/AppButton";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";
import { formatCompactNumber, formatNumber } from "../../utils/format";

type MemberLike = {
  id: string;

  username?: string | null;
  display_name?: string | null;
  name?: string | null;

  rank?: string | null;
  role?: string | null;

  hqLevel?: number | null;
  hq_level?: number | null;
  level?: number | null;

  mainSquad?: string | null;
  main_squad?: string | null;

  power?: number | null;

  weeklyVsScore?: number | null;
  weekly_vs_score?: number | null;

  weeklyDonations?: number | null;
  weekly_donations?: number | null;

  notes?: string | null;
};

type DailyStatLike = {
  id?: string;

  memberId?: string | null;
  member_id?: string | null;

  date?: string | null;

  weeklyVs?: number | null;
  weekly_vs?: number | null;
  versus_score?: number | null;
  vs_score?: number | null;

  donations?: number | null;
};

type AllianceStoreWithRoster = {
  members?: MemberLike[];
  dailyStats?: DailyStatLike[];
  deleteMember?: (memberId: string) => void | Promise<void>;
};

function getNumber(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}

function getMemberDisplayName(member: MemberLike) {
  return (
    member.display_name?.trim() ||
    member.username?.trim() ||
    member.name?.trim() ||
    "Unnamed Member"
  );
}

function getMemberRole(member: MemberLike) {
  return member.role || member.rank || "R1";
}

function getMemberLevel(member: MemberLike) {
  return getNumber(member.level ?? member.hqLevel ?? member.hq_level);
}

function getMemberMainSquad(member: MemberLike) {
  return member.mainSquad || member.main_squad || "No squad set";
}

function getMemberWeeklyVs(
  member: MemberLike,
  memberDailyStats: DailyStatLike[],
) {
  const memberValue = getNumber(member.weeklyVsScore ?? member.weekly_vs_score);

  if (memberValue > 0) {
    return memberValue;
  }

  return memberDailyStats.reduce((total, stat) => {
    return (
      total +
      getNumber(
        stat.weeklyVs ?? stat.weekly_vs ?? stat.versus_score ?? stat.vs_score,
      )
    );
  }, 0);
}

function getMemberWeeklyDonations(
  member: MemberLike,
  memberDailyStats: DailyStatLike[],
) {
  const memberValue = getNumber(
    member.weeklyDonations ?? member.weekly_donations,
  );

  if (memberValue > 0) {
    return memberValue;
  }

  return memberDailyStats.reduce((total, stat) => {
    return total + getNumber(stat.donations);
  }, 0);
}

export function MemberDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ memberId?: string | string[] }>();

  const memberId = Array.isArray(params.memberId)
    ? params.memberId[0]
    : params.memberId;

  const members = useAllianceStore(
    (state) => (state as AllianceStoreWithRoster).members ?? [],
  );

  const dailyStats = useAllianceStore(
    (state) => (state as AllianceStoreWithRoster).dailyStats ?? [],
  );

  const deleteMember = useAllianceStore(
    (state) => (state as AllianceStoreWithRoster).deleteMember,
  );

  const member = useMemo(() => {
    if (!memberId) {
      return undefined;
    }

    return members.find((item) => item.id === memberId);
  }, [members, memberId]);

  const memberDailyStats = useMemo(() => {
    if (!memberId) {
      return [];
    }

    return dailyStats
      .filter((stat) => {
        const statMemberId = stat.memberId ?? stat.member_id;
        return statMemberId === memberId;
      })
      .slice()
      .sort((a, b) => {
        const dateA = a.date ?? "";
        const dateB = b.date ?? "";

        return dateB.localeCompare(dateA);
      });
  }, [dailyStats, memberId]);

  const displayName = member ? getMemberDisplayName(member) : "";
  const role = member ? getMemberRole(member) : "R1";
  const level = member ? getMemberLevel(member) : 0;
  const mainSquad = member ? getMemberMainSquad(member) : "No squad set";
  const power = member ? getNumber(member.power) : 0;

  const totalVs = useMemo(() => {
    if (!member) {
      return 0;
    }

    return getMemberWeeklyVs(member, memberDailyStats);
  }, [member, memberDailyStats]);

  const totalDonations = useMemo(() => {
    if (!member) {
      return 0;
    }

    return getMemberWeeklyDonations(member, memberDailyStats);
  }, [member, memberDailyStats]);

  if (!member) {
    return (
      <RequireActiveAlliance>
        <View style={styles.center}>
          <Text style={styles.title}>Member not found</Text>

          <AppButton title="Go Back" onPress={() => router.back()} />
        </View>
      </RequireActiveAlliance>
    );
  }

  function confirmDelete() {
    Alert.alert(
      "Delete member?",
      `This will remove ${displayName} from the roster and assignments.`,
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
              if (!deleteMember) {
                Alert.alert(
                  "Delete Not Available",
                  "This screen could not find the delete member action.",
                );
                return;
              }

              await deleteMember(member.id);
              router.back();
            } catch (error) {
              console.error("DELETE MEMBER ERROR:", error);

              Alert.alert(
                "Could Not Delete Member",
                error instanceof Error
                  ? error.message
                  : "Something went wrong while deleting this member.",
              );
            }
          },
        },
      ],
    );
  }

  return (
    <RequireActiveAlliance>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <Text style={styles.username}>{displayName}</Text>

          <Text style={styles.meta}>
            {role.toUpperCase()} · HQ {level || "—"} · {mainSquad}
          </Text>
        </View>

        <View style={styles.grid}>
          <Info label="Power" value={formatCompactNumber(power ?? 0)} />
          <Info label="HQ Level" value={(level || 0).toString()} />
        </View>

        <View style={styles.grid}>
          <Info label="Weekly VS" value={formatCompactNumber(totalVs ?? 0)} />
          <Info label="Donations" value={formatNumber(totalDonations ?? 0)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>R4 Notes</Text>

          <Text style={styles.notes}>
            {member.notes?.trim() || "No notes yet."}
          </Text>
        </View>

        <AppButton
          title="View Stats"
          onPress={() =>
            router.push({
              pathname: "../members/stats",
              params: {
                memberId: member.id,
              },
            })
          }
        />

        <AppButton
          title="Edit Member"
          onPress={() =>
            router.push({
              pathname: "/members/edit",
              params: {
                memberId: member.id,
              },
            })
          }
        />

        <AppButton
          title="Delete Member"
          variant="danger"
          onPress={confirmDelete}
        />
      </ScrollView>
    </RequireActiveAlliance>
  );
}

export default MemberDetailScreen;

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    gap: 14,
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },

  username: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },

  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },

  meta: {
    color: colors.muted,
  },

  grid: {
    flexDirection: "row",
    gap: 12,
  },

  info: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },

  infoLabel: {
    color: colors.muted,
    fontWeight: "600",
  },

  infoValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },

  notes: {
    color: colors.muted,
    lineHeight: 20,
  },

  historyRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 10,
    gap: 2,
  },

  historyDate: {
    color: colors.text,
    fontWeight: "800",
  },

  historyText: {
    color: colors.muted,
  },
});
