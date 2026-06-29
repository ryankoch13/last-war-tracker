import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { AppButton } from "../../components/AppButton";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";

type ViewMode = "daily" | "weekly" | "monthly";
type MetricMode = "vsScore" | "donations";

type ChartItem = {
  key: string;
  label: string;
  rangeLabel: string;
  startDate: string;
  endDate: string;
  vsScore: number;
  donations: number;
};

const ALL_MEMBERS_ID = "__all_members__";

const VIEW_MODES: { label: string; value: ViewMode }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const METRIC_MODES: { label: string; value: MetricMode }[] = [
  { label: "VS Score", value: "vsScore" },
  { label: "Donations", value: "donations" },
];

export function MemberStatsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ memberId?: string | string[] }>();

  const routeMemberId = Array.isArray(params.memberId)
    ? params.memberId[0]
    : params.memberId;

  const members = useAllianceStore((state) => state.members ?? []);
  const dailyStats = useAllianceStore((state) => state.dailyStats ?? []);

  const [selectedMemberId, setSelectedMemberId] = useState(
    routeMemberId ?? ALL_MEMBERS_ID,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [metricMode, setMetricMode] = useState<MetricMode>("vsScore");

  useEffect(() => {
    if (routeMemberId) {
      setSelectedMemberId(routeMemberId);
    }
  }, [routeMemberId]);

  const selectedMember = useMemo(() => {
    if (selectedMemberId === ALL_MEMBERS_ID) return undefined;

    return members.find((member) => member.id === selectedMemberId);
  }, [members, selectedMemberId]);

  const filteredStats = useMemo(() => {
    if (selectedMemberId === ALL_MEMBERS_ID) {
      return dailyStats;
    }

    return dailyStats.filter(
      (stat) => getStatMemberId(stat) === selectedMemberId,
    );
  }, [dailyStats, selectedMemberId]);

  const chartItems = useMemo(() => {
    return buildChartItems(viewMode, filteredStats);
  }, [viewMode, filteredStats]);

  const totalVsScore = useMemo(() => {
    return chartItems.reduce((total, item) => total + item.vsScore, 0);
  }, [chartItems]);

  const totalDonations = useMemo(() => {
    return chartItems.reduce((total, item) => total + item.donations, 0);
  }, [chartItems]);

  function openDailyStats(date?: string) {
    if (selectedMemberId === ALL_MEMBERS_ID) {
      Alert.alert(
        "Select a member",
        "Choose a specific member before adding daily stats.",
      );
      return;
    }

    router.push({
      pathname: "/(tabs)/members/add-daily-stats",
      params: {
        memberId: selectedMemberId,
        ...(date ? { date } : {}),
      },
    });
  }

  return (
    <RequireActiveAlliance>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>Member Stats</Text>
          <Text style={styles.title}>
            {selectedMember?.name ?? "Alliance Stats"}
          </Text>
          <Text style={styles.description}>
            View VS scores and donations by day, week, or month.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Member</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memberSelector}
          >
            <SelectorChip
              label="All"
              selected={selectedMemberId === ALL_MEMBERS_ID}
              onPress={() => setSelectedMemberId(ALL_MEMBERS_ID)}
            />

            {members.map((member) => (
              <SelectorChip
                key={member.id}
                label={member.name}
                selected={selectedMemberId === member.id}
                onPress={() => setSelectedMemberId(member.id)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.segmentedControl}>
          {VIEW_MODES.map((item) => (
            <SegmentButton
              key={item.value}
              label={item.label}
              selected={viewMode === item.value}
              onPress={() => setViewMode(item.value)}
            />
          ))}
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard label="VS Score" value={formatNumber(totalVsScore)} />
          <SummaryCard label="Donations" value={formatNumber(totalDonations)} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Graph</Text>
          </View>

          <View style={styles.segmentedControl}>
            {METRIC_MODES.map((item) => (
              <SegmentButton
                key={item.value}
                label={item.label}
                selected={metricMode === item.value}
                onPress={() => setMetricMode(item.value)}
              />
            ))}
          </View>

          <StatsBarChart items={chartItems} metricMode={metricMode} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {getBreakdownTitle(viewMode)}
            </Text>

            {selectedMemberId !== ALL_MEMBERS_ID ? (
              <Pressable onPress={() => openDailyStats()}>
                <Text style={styles.inlineAction}>Add Stats</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.breakdownList}>
            {[...chartItems].reverse().map((item) => (
              <Pressable
                key={item.key}
                style={styles.breakdownRow}
                onPress={() => {
                  if (viewMode === "daily") {
                    openDailyStats(item.startDate);
                  }
                }}
              >
                <View>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <Text style={styles.breakdownSubLabel}>
                    {item.rangeLabel}
                  </Text>
                </View>

                <View style={styles.breakdownValues}>
                  <Text style={styles.breakdownValue}>
                    VS: {formatNumber(item.vsScore)}
                  </Text>
                  <Text style={styles.breakdownValue}>
                    Don: {formatNumber(item.donations)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {selectedMemberId !== ALL_MEMBERS_ID ? (
          <AppButton title="Add Daily Stats" onPress={() => openDailyStats()} />
        ) : null}
      </ScrollView>
    </RequireActiveAlliance>
  );
}

export default MemberStatsScreen;

type SelectorChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function SelectorChip({ label, selected, onPress }: SelectorChipProps) {
  return (
    <Pressable
      style={[styles.selectorChip, selected && styles.selectorChipSelected]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.selectorChipText,
          selected && styles.selectorChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type SegmentButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function SegmentButton({ label, selected, onPress }: SegmentButtonProps) {
  return (
    <Pressable
      style={[styles.segmentButton, selected && styles.segmentButtonSelected]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.segmentButtonText,
          selected && styles.segmentButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
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

type StatsBarChartProps = {
  items: ChartItem[];
  metricMode: MetricMode;
};

function StatsBarChart({ items, metricMode }: StatsBarChartProps) {
  const maxValue = Math.max(...items.map((item) => item[metricMode]), 0);

  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No stats to display yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      {items.map((item) => {
        const value = item[metricMode];
        const widthPercent =
          maxValue <= 0 ? 0 : Math.max((value / maxValue) * 100, 4);

        return (
          <View key={item.key} style={styles.chartRow}>
            <Text style={styles.chartLabel}>{item.label}</Text>

            <View style={styles.chartTrack}>
              <View
                style={[
                  styles.chartFill,
                  {
                    width: `${widthPercent}%`,
                    opacity: value > 0 ? 1 : 0,
                  },
                ]}
              />
            </View>

            <Text style={styles.chartValue}>{formatCompactNumber(value)}</Text>
          </View>
        );
      })}
    </View>
  );
}

function buildChartItems(viewMode: ViewMode, stats: any[]): ChartItem[] {
  switch (viewMode) {
    case "weekly":
      return buildWeeklyItems(stats);
    case "monthly":
      return buildMonthlyItems(stats);
    case "daily":
    default:
      return buildDailyItems(stats);
  }
}

function buildDailyItems(stats: any[]): ChartItem[] {
  const today = new Date();

  return Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(today, index - 6);
    const dateKey = toDateKey(date);

    const aggregate = aggregateStats(stats, dateKey, dateKey);

    return {
      key: dateKey,
      label: formatShortDate(dateKey),
      rangeLabel: dateKey,
      startDate: dateKey,
      endDate: dateKey,
      ...aggregate,
    };
  });
}

function buildWeeklyItems(stats: any[]): ChartItem[] {
  const currentWeekStart = getStartOfWeek(new Date());

  return Array.from({ length: 8 }).map((_, index) => {
    const start = addDays(currentWeekStart, (index - 7) * 7);
    const end = addDays(start, 6);

    const startDate = toDateKey(start);
    const endDate = toDateKey(end);

    const aggregate = aggregateStats(stats, startDate, endDate);

    return {
      key: startDate,
      label: formatShortDate(startDate),
      rangeLabel: `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`,
      startDate,
      endDate,
      ...aggregate,
    };
  });
}

function buildMonthlyItems(stats: any[]): ChartItem[] {
  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return Array.from({ length: 6 }).map((_, index) => {
    const start = addMonths(currentMonthStart, index - 5);
    const end = addDays(addMonths(start, 1), -1);

    const startDate = toDateKey(start);
    const endDate = toDateKey(end);

    const aggregate = aggregateStats(stats, startDate, endDate);

    return {
      key: startDate,
      label: formatMonthLabel(start),
      rangeLabel: `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`,
      startDate,
      endDate,
      ...aggregate,
    };
  });
}

function aggregateStats(stats: any[], startDate: string, endDate: string) {
  return stats.reduce(
    (totals, stat) => {
      const date = getStatDate(stat);

      if (!date || date < startDate || date > endDate) {
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
}

function getStatMemberId(stat: any) {
  return stat.memberId ?? stat.member_id;
}

function getStatDate(stat: any) {
  return stat.date;
}

function getStatVsScore(stat: any) {
  return Number(
    stat.vsScore ?? stat.vs_score ?? stat.vsScore ?? stat.versus_points ?? 0,
  );
}

function getStatDonations(stat: any) {
  return Number(stat.donations ?? 0);
}

function getBreakdownTitle(viewMode: ViewMode) {
  switch (viewMode) {
    case "weekly":
      return "Weekly Breakdown";
    case "monthly":
      return "Monthly Breakdown";
    case "daily":
    default:
      return "Daily Breakdown";
  }
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function addMonths(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + amount);
  return copy;
}

function getStartOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;

  copy.setDate(copy.getDate() - daysSinceMonday);
  copy.setHours(0, 0, 0, 0);

  return copy;
}

function formatShortDate(dateKey: string) {
  const date = parseDateKey(dateKey);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
  });
}

function formatNumber(value: number | null | undefined) {
  return Math.round(value ?? 0).toLocaleString();
}

function formatCompactNumber(value: number | null | undefined) {
  const safeValue = value ?? 0;

  if (safeValue >= 1_000_000_000) {
    return `${(safeValue / 1_000_000_000).toFixed(1)}B`;
  }

  if (safeValue >= 1_000_000) {
    return `${(safeValue / 1_000_000).toFixed(1)}M`;
  }

  if (safeValue >= 1_000) {
    return `${(safeValue / 1_000).toFixed(1)}K`;
  }

  return Math.round(safeValue).toLocaleString();
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
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
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
    fontSize: 24,
    fontWeight: "900",
  },
  description: {
    color: colors.muted,
    marginTop: 6,
    lineHeight: 20,
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
    fontSize: 16,
    fontWeight: "900",
  },
  inlineAction: {
    color: colors.text,
    fontWeight: "900",
  },
  memberSelector: {
    gap: 8,
    paddingRight: 16,
  },
  selectorChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  selectorChipSelected: {
    borderColor: colors.text,
  },
  selectorChipText: {
    color: colors.muted,
    fontWeight: "800",
  },
  selectorChipTextSelected: {
    color: colors.text,
  },
  segmentedControl: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    flexDirection: "row",
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  segmentButtonSelected: {
    backgroundColor: colors.background,
  },
  segmentButtonText: {
    color: colors.muted,
    fontWeight: "800",
  },
  segmentButtonTextSelected: {
    color: colors.text,
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
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 6,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chartLabel: {
    color: colors.muted,
    width: 58,
    fontSize: 12,
    fontWeight: "800",
  },
  chartTrack: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  chartFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.text,
  },
  chartValue: {
    color: colors.text,
    width: 52,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  emptyText: {
    color: colors.muted,
    textAlign: "center",
  },
  breakdownList: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  breakdownRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  breakdownLabel: {
    color: colors.text,
    fontWeight: "900",
  },
  breakdownSubLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  breakdownValues: {
    alignItems: "flex-end",
    gap: 3,
  },
  breakdownValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
});
