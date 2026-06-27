import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../../components/AppButton";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";
import { formatCompactNumber, formatNumber } from "../../utils/format";

export function MemberDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ memberId?: string | string[] }>();

  const memberId = Array.isArray(params.memberId)
    ? params.memberId[0]
    : params.memberId;

  const members = useAllianceStore((state) => state.members);
  const dailyStats = useAllianceStore((state) => state.dailyStats);
  const deleteMember = useAllianceStore((state) => state.deleteMember);

  const member = useMemo(() => {
    if (!memberId) return undefined;
    return members.find((item) => item.id === memberId);
  }, [members, memberId]);

  const memberDailyStats = useMemo(() => {
    if (!memberId) return [];

    return dailyStats
      .filter((stat) => stat.memberId === memberId)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dailyStats, memberId]);

  const totalVs = useMemo(() => {
    return memberDailyStats.reduce((total, stat) => total + stat.weeklyVs, 0);
  }, [memberDailyStats]);

  const totalDonations = useMemo(() => {
    return memberDailyStats.reduce((total, stat) => total + stat.donations, 0);
  }, [memberDailyStats]);

  if (!member) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Member not found</Text>
      </View>
    );
  }

  function confirmDelete() {
    Alert.alert(
      "Delete member?",
      `This will remove ${member.username} from the roster and assignments.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMember(member.id);
            router.back();
          },
        },
      ],
    );
  }

  if (!member) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Member not found",
          }}
        />

        <View style={styles.center}>
          <Text style={styles.title}>Member not found</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: member.username,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <Text style={styles.username}>{member.username}</Text>
          <Text style={styles.meta}>
            {member.rank} · HQ {member.hqLevel} · {member.mainSquad}
          </Text>
        </View>

        <View style={styles.grid}>
          <Info label="Power" value={formatCompactNumber(member.power)} />
          <Info label="HQ Level" value={member.hqLevel.toString()} />
        </View>

        <View style={styles.grid}>
          <Info label="VS Total" value={formatCompactNumber(totalVs)} />
          <Info label="Donations" value={formatNumber(totalDonations)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Daily History</Text>

          {memberDailyStats.length === 0 ? (
            <Text style={styles.notes}>No daily stats recorded yet.</Text>
          ) : (
            memberDailyStats.map((stat) => (
              <View key={stat.id} style={styles.historyRow}>
                <Text style={styles.historyDate}>{stat.date}</Text>
                <Text style={styles.historyText}>
                  VS: {formatCompactNumber(stat.weeklyVs)}
                </Text>
                <Text style={styles.historyText}>
                  Donations: {formatNumber(stat.donations)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>R4 Notes</Text>
          <Text style={styles.notes}>
            {member.notes?.trim() || "No notes yet."}
          </Text>
        </View>

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
    </>
  );
}

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
