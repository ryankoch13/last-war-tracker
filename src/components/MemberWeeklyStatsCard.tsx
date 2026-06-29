import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAllianceStore } from "../store/allianceStore";
import { colors } from "../theme/colors";
import {
    addWeeks,
    formatShortDate,
    formatWeekRange,
    formatWeekday,
    getDateKey,
    getStartOfWeek,
    getWeekDays,
} from "../utils/dateStats";
import { formatCompactNumber, formatNumber } from "../utils/format";

function parseNumberInput(value: string) {
  const cleaned = value.replace(/,/g, "").trim();

  if (!cleaned) {
    return 0;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

type MemberWeeklyStatsCardProps = {
  memberId: string;
};

export function MemberWeeklyStatsCard({
  memberId,
}: MemberWeeklyStatsCardProps) {
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));

  const dailyStats = useAllianceStore((state) => state.dailyStats);
  const upsertDailyStat = useAllianceStore((state) => state.upsertDailyStat);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const statsByDate = useMemo(() => {
    const map = new Map<
      string,
      {
        weeklyVs: number;
        donations: number;
      }
    >();

    dailyStats
      .filter((stat) => stat.memberId === memberId)
      .forEach((stat) => {
        map.set(stat.date, {
          weeklyVs: stat.weeklyVs,
          donations: stat.donations,
        });
      });

    return map;
  }, [dailyStats, memberId]);

  const weeklyTotals = useMemo(() => {
    return weekDays.reduce(
      (totals, day) => {
        const dateKey = getDateKey(day);
        const stat = statsByDate.get(dateKey);

        return {
          weeklyVs: totals.weeklyVs + (stat?.weeklyVs ?? 0),
          donations: totals.donations + (stat?.donations ?? 0),
        };
      },
      {
        weeklyVs: 0,
        donations: 0,
      },
    );
  }, [statsByDate, weekDays]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setWeekStart((current) => addWeeks(current, -1))}
          style={({ pressed }) => [
            styles.weekButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.weekButtonText}>‹</Text>
        </Pressable>

        <View style={styles.weekTitleWrapper}>
          <Text style={styles.title}>Weekly Stats</Text>
          <Text style={styles.weekRange}>{formatWeekRange(weekStart)}</Text>
        </View>

        <Pressable
          onPress={() => setWeekStart((current) => addWeeks(current, 1))}
          style={({ pressed }) => [
            styles.weekButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.weekButtonText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.totalsRow}>
        <View style={styles.totalPill}>
          <Text style={styles.totalLabel}>VS</Text>
          <Text style={styles.totalValue}>
            {formatCompactNumber(weeklyTotals.weeklyVs)}
          </Text>
        </View>

        <View style={styles.totalPill}>
          <Text style={styles.totalLabel}>Donations</Text>
          <Text style={styles.totalValue}>
            {formatNumber(weeklyTotals.donations)}
          </Text>
        </View>
      </View>

      <View style={styles.daysList}>
        {weekDays.map((day) => {
          const dateKey = getDateKey(day);
          const stat = statsByDate.get(dateKey);

          return (
            <View key={dateKey} style={styles.dayRow}>
              <View style={styles.dateColumn}>
                <Text style={styles.weekday}>{formatWeekday(day)}</Text>
                <Text style={styles.date}>{formatShortDate(day)}</Text>
              </View>

              <StatInput
                label="VS"
                value={stat?.weeklyVs ?? 0}
                onCommit={(value) =>
                  upsertDailyStat(memberId, dateKey, {
                    weeklyVs: value,
                  })
                }
              />

              <StatInput
                label="Donations"
                value={stat?.donations ?? 0}
                onCommit={(value) =>
                  upsertDailyStat(memberId, dateKey, {
                    donations: value,
                  })
                }
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StatInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
}) {
  const [text, setText] = useState(value ? String(value) : "");

  useEffect(() => {
    setText(value ? String(value) : "");
  }, [value]);

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        onBlur={() => onCommit(parseNumberInput(text))}
        onSubmitEditing={() => onCommit(parseNumberInput(text))}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  weekTitleWrapper: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  weekRange: {
    color: colors.muted,
    marginTop: 2,
    fontWeight: "600",
  },
  weekButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekButtonText: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 30,
  },
  totalsRow: {
    flexDirection: "row",
    gap: 10,
  },
  totalPill: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  totalValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  daysList: {
    gap: 10,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateColumn: {
    width: 58,
  },
  weekday: {
    color: colors.text,
    fontWeight: "800",
  },
  date: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  inputWrapper: {
    flex: 1,
    gap: 4,
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: 10,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.65,
  },
});
