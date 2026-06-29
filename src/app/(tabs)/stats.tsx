import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function getDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function parseStatNumber(value: string) {
  const cleanedValue = value.replace(/,/g, "").trim();

  if (!cleanedValue) {
    return 0;
  }

  const parsedValue = Number(cleanedValue);

  if (Number.isNaN(parsedValue)) {
    return 0;
  }

  return Math.max(0, Math.round(parsedValue));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRole(role: string | null | undefined) {
  return role ? role.toUpperCase() : "R1";
}

export default function StatsScreen() {
  const activeAlliance = useAllianceStore((state) => state.activeAlliance);
  const members = useAllianceStore((state) => state.members ?? []);
  const dailyStats = useAllianceStore((state) => state.dailyStats ?? []);

  const addDailyStat = useAllianceStore((state) => state.addDailyStat);
  const updateDailyStat = useAllianceStore((state) => state.updateDailyStat);
  const deleteDailyStat = useAllianceStore((state) => state.deleteDailyStat);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [date, setDate] = useState(todayString());
  const [donationsInput, setDonationsInput] = useState("");
  const [vsScoreInput, setvsScoreInput] = useState("");
  const [notes, setNotes] = useState("");

  const activeMembers = useMemo(() => {
    return members
      .filter((member) => member.isActive !== false)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  const selectedMember = useMemo(() => {
    if (!selectedMemberId) {
      return null;
    }

    return (
      activeMembers.find((member) => member.id === selectedMemberId) ?? null
    );
  }, [activeMembers, selectedMemberId]);

  const selectedDayStat = useMemo(() => {
    if (!selectedMemberId) {
      return undefined;
    }

    return dailyStats.find((stat) => {
      return stat.memberId === selectedMemberId && stat.date === date;
    });
  }, [dailyStats, selectedMemberId, date]);

  const recentStats = useMemo(() => {
    return dailyStats
      .slice()
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      })
      .slice(0, 10);
  }, [dailyStats]);

  const todayStats = useMemo(() => {
    const today = todayString();

    return dailyStats.filter((stat) => stat.date === today);
  }, [dailyStats]);

  const weekStats = useMemo(() => {
    const weekStart = getDateDaysAgo(6);
    const today = todayString();

    return dailyStats.filter((stat) => {
      return stat.date >= weekStart && stat.date <= today;
    });
  }, [dailyStats]);

  const selectedMemberWeekStats = useMemo(() => {
    if (!selectedMemberId) {
      return [];
    }

    const weekStart = getDateDaysAgo(6);
    const today = todayString();

    return dailyStats.filter((stat) => {
      return (
        stat.memberId === selectedMemberId &&
        stat.date >= weekStart &&
        stat.date <= today
      );
    });
  }, [dailyStats, selectedMemberId]);

  const todayDonations = todayStats.reduce((sum, stat) => {
    return sum + Number(stat.donations ?? 0);
  }, 0);

  const todayvsScore = todayStats.reduce((sum, stat) => {
    return sum + Number(stat.vsScore ?? 0);
  }, 0);

  const weekDonations = weekStats.reduce((sum, stat) => {
    return sum + Number(stat.donations ?? 0);
  }, 0);

  const weekvsScore = weekStats.reduce((sum, stat) => {
    return sum + Number(stat.vsScore ?? 0);
  }, 0);

  const selectedMemberWeekDonations = selectedMemberWeekStats.reduce(
    (sum, stat) => sum + Number(stat.donations ?? 0),
    0,
  );

  const selectedMemberWeekvsScore = selectedMemberWeekStats.reduce(
    (sum, stat) => sum + Number(stat.vsScore ?? 0),
    0,
  );

  useEffect(() => {
    if (!selectedMemberId && activeMembers.length > 0) {
      setSelectedMemberId(activeMembers[0].id);
      return;
    }

    if (
      selectedMemberId &&
      activeMembers.length > 0 &&
      !activeMembers.some((member) => member.id === selectedMemberId)
    ) {
      setSelectedMemberId(activeMembers[0].id);
    }
  }, [activeMembers, selectedMemberId]);

  useEffect(() => {
    if (selectedDayStat) {
      setDonationsInput(String(selectedDayStat.donations ?? 0));
      setvsScoreInput(String(selectedDayStat.vsScore ?? 0));
      setNotes(selectedDayStat.notes ?? "");
      return;
    }

    setDonationsInput("");
    setvsScoreInput("");
    setNotes("");
  }, [selectedDayStat]);

  function handleSaveStat() {
    if (!selectedMemberId) {
      Alert.alert("Member required", "Select a member before saving stats.");
      return;
    }

    const trimmedDate = date.trim();

    if (!trimmedDate) {
      Alert.alert("Date required", "Enter a date in YYYY-MM-DD format.");
      return;
    }

    const donations = parseStatNumber(donationsInput);
    const vsScore = parseStatNumber(vsScoreInput);
    const trimmedNotes = notes.trim();

    if (selectedDayStat) {
      updateDailyStat(selectedDayStat.id, {
        date: trimmedDate,
        donations,
        vsScore,
        notes: trimmedNotes,
      });
    } else {
      addDailyStat({
        memberId: selectedMemberId,
        date: trimmedDate,
        donations,
        vsScore,
        notes: trimmedNotes,
        updatedAt: new Date().toISOString(),
      });
    }

    Alert.alert("Stats saved", "Daily stats have been updated.");
  }

  function confirmDeleteStat() {
    if (!selectedDayStat) {
      return;
    }

    Alert.alert(
      "Delete stats?",
      "This will remove the selected member's stats for this date.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteDailyStat(selectedDayStat.id),
        },
      ],
    );
  }

  function getMemberName(memberId: string) {
    return members.find((member) => member.id === memberId)?.name ?? "Unknown";
  }

  return (
    <RequireActiveAlliance>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Alliance Stats</Text>
          <Text style={styles.title}>Daily Stats</Text>
          <Text style={styles.subtitle}>
            Track member donations, VS points, and participation by day.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Alliance</Text>
          <Text style={styles.allianceName}>
            {activeAlliance?.name ?? "Your Alliance"}
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Today&apos;s Donations</Text>
            <Text style={styles.summaryValue}>
              {formatNumber(todayDonations)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Today&apos;s VS</Text>
            <Text style={styles.summaryValue}>
              {formatNumber(todayvsScore)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>7-Day Donations</Text>
            <Text style={styles.summaryValue}>
              {formatNumber(weekDonations)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>7-Day VS</Text>
            <Text style={styles.summaryValue}>{formatNumber(weekvsScore)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {selectedDayStat ? "Edit Daily Entry" : "Add Daily Entry"}
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Member</Text>

            {activeMembers.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.memberPicker}
              >
                {activeMembers.map((member) => {
                  const selected = selectedMemberId === member.id;

                  return (
                    <Pressable
                      key={member.id}
                      style={[
                        styles.memberChip,
                        selected && styles.memberChipActive,
                      ]}
                      onPress={() => setSelectedMemberId(member.id)}
                    >
                      <Text
                        style={[
                          styles.memberChipText,
                          selected && styles.memberChipTextActive,
                        ]}
                      >
                        {member.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>
                Add members before entering daily stats.
              </Text>
            )}
          </View>

          {selectedMember ? (
            <View style={styles.selectedMemberBox}>
              <Text style={styles.selectedMemberName}>
                {selectedMember.name}
              </Text>
              <Text style={styles.selectedMemberMeta}>
                {formatRole(selectedMember.role)} · Level{" "}
                {selectedMember.level ?? "—"}
              </Text>
              <Text style={styles.selectedMemberMeta}>
                7-day donations: {formatNumber(selectedMemberWeekDonations)}
              </Text>
              <Text style={styles.selectedMemberMeta}>
                7-day VS: {formatNumber(selectedMemberWeekvsScore)}
              </Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldColumn}>
              <Text style={styles.label}>Donations</Text>
              <TextInput
                value={donationsInput}
                onChangeText={setDonationsInput}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldColumn}>
              <Text style={styles.label}>VS Points</Text>
              <TextInput
                value={vsScoreInput}
                onChangeText={setvsScoreInput}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="sentences"
              multiline
              style={[styles.input, styles.notesInput]}
            />
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.primaryButton} onPress={handleSaveStat}>
              <Text style={styles.primaryButtonText}>
                {selectedDayStat ? "Update Stats" : "Save Stats"}
              </Text>
            </Pressable>

            {selectedDayStat ? (
              <Pressable
                style={styles.deleteButton}
                onPress={confirmDeleteStat}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>

          {recentStats.length > 0 ? (
            recentStats.map((stat) => (
              <View key={stat.id} style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statMember}>
                    {getMemberName(stat.memberId)}
                  </Text>
                  <Text style={styles.statMeta}>{stat.date}</Text>
                  {stat.notes ? (
                    <Text style={styles.statNotes}>{stat.notes}</Text>
                  ) : null}
                </View>

                <View style={styles.statNumbers}>
                  <Text style={styles.statNumber}>
                    {formatNumber(Number(stat.donations ?? 0))}
                  </Text>
                  <Text style={styles.statNumberLabel}>Donations</Text>

                  <Text style={[styles.statNumber, styles.statNumberSpacing]}>
                    {formatNumber(Number(stat.vsScore ?? 0))}
                  </Text>
                  <Text style={styles.statNumberLabel}>VS</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No stats yet</Text>
              <Text style={styles.emptyText}>
                Add a daily entry above to start tracking alliance progress.
              </Text>
            </View>
          )}
        </View>
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
    color: colors.primary,
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
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 22,
    backgroundColor: "#ffffff",
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 2,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  allianceName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  summaryCard: {
    width: "48%",
    minHeight: 96,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 14,
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  summaryValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  fieldColumn: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d8d8d8",
    backgroundColor: "#ffffff",
    color: "#111111",
    paddingHorizontal: 14,
    fontSize: 16,
  },
  notesInput: {
    minHeight: 86,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  memberPicker: {
    paddingRight: 20,
  },
  memberChip: {
    minHeight: 38,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d8d8d8",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    marginRight: 8,
  },
  memberChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  memberChipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  memberChipTextActive: {
    color: "#ffffff",
  },
  selectedMemberBox: {
    borderRadius: 16,
    backgroundColor: "rgba(79, 70, 229, 0.08)",
    padding: 14,
    marginBottom: 16,
  },
  selectedMemberName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
  },
  selectedMemberMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  deleteButton: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 18,
  },
  deleteButtonText: {
    color: "#b91c1c",
    fontSize: 15,
    fontWeight: "900",
  },
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 10,
  },
  statInfo: {
    flex: 1,
    paddingRight: 12,
  },
  statMember: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 3,
  },
  statMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  statNotes: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  statNumbers: {
    alignItems: "flex-end",
  },
  statNumber: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  statNumberSpacing: {
    marginTop: 8,
  },
  statNumberLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  emptyCard: {
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 18,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
