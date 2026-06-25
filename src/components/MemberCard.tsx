import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import type { AllianceMember } from "../types/alliance";
import { formatCompactNumber } from "../utils/format";

type Props = {
  member: AllianceMember;
  onPress?: () => void;
};

export function MemberCard({ member, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View>
          <Text style={styles.username}>{member.username}</Text>
          <Text style={styles.meta}>
            {member.rank} · HQ {member.hqLevel} · {member.mainSquad}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {formatCompactNumber(member.power)}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>
          VS: {formatCompactNumber(member.weeklyVsScore)}
        </Text>
        <Text style={styles.stat}>
          Donations: {formatCompactNumber(member.weeklyDonations)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  username: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  meta: {
    color: colors.muted,
    marginTop: 4,
  },
  badge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: colors.primaryDark,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  stat: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
});
