import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/AppButton";
import { DailyMemberStat, useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";
import type { AllianceMember } from "@/types/alliance";

type StatFormState = {
  editingStatId?: string;
  date: string;
  vsScore: string;
  donations: string;
  notes: string;
};

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getLastSevenDateKeys() {
  const dates: string[] = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
}

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getMemberDisplayName(member?: AllianceMember) {
  if (!member) {
    return "Member";
  }

  return member.username;
}

const emptyForm: StatFormState = {
  date: getTodayDateKey(),
  vsScore: "",
  donations: "",
  notes: "",
};

export default function MemberStatsScreen() {
  const params = useLocalSearchParams<{
    memberId?: string | string[];
  }>();

  const routeMemberId = getParamValue(params.memberId);

  const members = useAllianceStore((state) => state.members);
  const dailyStats = useAllianceStore((state) => state.dailyStats);

  const addDailyStat = useAllianceStore((state) => state.addDailyStat);
  const updateDailyStat = useAllianceStore((state) => state.updateDailyStat);
  const deleteDailyStat = useAllianceStore((state) => state.deleteDailyStat);

  const selectedMember = useMemo(() => {
    if (routeMemberId) {
      return members.find((member) => member.id === routeMemberId);
    }

    return members[0];
  }, [members, routeMemberId]);

  const selectedMemberId = selectedMember?.id;

  const memberStats = useMemo(() => {
    if (!selectedMemberId) {
      return [];
    }

    return dailyStats
      .filter((stat) => stat.memberId === selectedMemberId)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dailyStats, selectedMemberId]);

  const weeklyDateKeys = useMemo(() => getLastSevenDateKeys(), []);

  const statsByDate = useMemo(() => {
    const map = new Map<string, DailyMemberStat>();

    memberStats.forEach((stat) => {
      map.set(stat.date, stat);
    });

    return map;
  }, [memberStats]);

  const totals = useMemo(() => {
    return memberStats.reduce(
      (acc, stat) => {
        acc.vsScore += stat.vsScore;
        acc.donations += stat.donations;
        return acc;
      },
      {
        vsScore: 0,
        donations: 0,
      },
    );
  }, [memberStats]);

  const [form, setForm] = useState<StatFormState>(emptyForm);

  function resetForm() {
    setForm({
      ...emptyForm,
      date: getTodayDateKey(),
    });
  }

  function startEditingStat(stat: DailyMemberStat) {
    setForm({
      editingStatId: stat.id,
      date: stat.date,
      vsScore: String(stat.vsScore),
      donations: String(stat.donations),
      notes: stat.notes ?? "",
    });
  }

  function saveStat() {
    if (!selectedMemberId) {
      Alert.alert("No member selected", "Create or select a member first.");
      return;
    }

    const trimmedDate = form.date.trim();

    if (!trimmedDate) {
      Alert.alert("Missing date", "Enter a date for this stat.");
      return;
    }

    const vsScore = Number(form.vsScore || 0);
    const donations = Number(form.donations || 0);

    if (Number.isNaN(vsScore) || Number.isNaN(donations)) {
      Alert.alert(
        "Invalid values",
        "Versus points and donations must be numbers.",
      );
      return;
    }

    if (vsScore < 0 || donations < 0) {
      Alert.alert("Invalid values", "Values cannot be negative.");
      return;
    }

    const existingStatForDate = memberStats.find(
      (stat) => stat.date === trimmedDate,
    );

    if (form.editingStatId) {
      updateDailyStat(form.editingStatId, {
        memberId: selectedMemberId,
        date: trimmedDate,
        vsScore,
        donations,
        notes: form.notes.trim(),
      });
    } else if (existingStatForDate) {
      updateDailyStat(existingStatForDate.id, {
        vsScore,
        donations,
        notes: form.notes.trim(),
      });
    } else {
      addDailyStat({
        memberId: selectedMemberId,
        date: trimmedDate,
        vsScore,
        donations,
        notes: form.notes.trim(),
      });
    }

    resetForm();
  }

  function confirmDeleteStat(stat: DailyMemberStat) {
    Alert.alert("Delete stat?", "This will remove this daily entry.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteDailyStat(stat.id),
      },
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${getMemberDisplayName(selectedMember)} Stats`,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {!selectedMember ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No member selected</Text>
            <Text style={styles.emptyText}>
              Add a member first, then come back here to enter daily VS points
              and donations.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.headerCard}>
              <Text style={styles.title}>{selectedMember.username}</Text>
              <Text style={styles.subtitle}>
                Track daily versus points and alliance donations.
              </Text>

              <View style={styles.summaryRow}>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Total VS</Text>
                  <Text style={styles.summaryValue}>
                    {totals.vsScore.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Total Donations</Text>
                  <Text style={styles.summaryValue}>
                    {totals.donations.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>This Week</Text>

              <View style={styles.weekGrid}>
                {weeklyDateKeys.map((dateKey) => {
                  const stat = statsByDate.get(dateKey);

                  return (
                    <Pressable
                      key={dateKey}
                      onPress={() =>
                        stat
                          ? startEditingStat(stat)
                          : setForm({
                              ...emptyForm,
                              date: dateKey,
                            })
                      }
                      style={({ pressed }) => [
                        styles.dayCard,
                        stat && styles.dayCardFilled,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.dayDate}>{dateKey.slice(5)}</Text>
                      <Text style={styles.dayValue}>
                        VS: {stat?.vsScore.toLocaleString() ?? "—"}
                      </Text>
                      <Text style={styles.dayValue}>
                        Don: {stat?.donations.toLocaleString() ?? "—"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {form.editingStatId ? "Edit Daily Entry" : "Add Daily Entry"}
              </Text>

              <View style={styles.formCard}>
                <View style={styles.field}>
                  <Text style={styles.label}>Date</Text>
                  <TextInput
                    value={form.date}
                    onChangeText={(date) =>
                      setForm((current) => ({
                        ...current,
                        date,
                      }))
                    }
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Versus Points</Text>
                  <TextInput
                    value={form.vsScore}
                    onChangeText={(vsScore) =>
                      setForm((current) => ({
                        ...current,
                        vsScore,
                      }))
                    }
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Donations</Text>
                  <TextInput
                    value={form.donations}
                    onChangeText={(donations) =>
                      setForm((current) => ({
                        ...current,
                        donations,
                      }))
                    }
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Notes</Text>
                  <TextInput
                    value={form.notes}
                    onChangeText={(notes) =>
                      setForm((current) => ({
                        ...current,
                        notes,
                      }))
                    }
                    placeholder="Optional notes..."
                    placeholderTextColor={colors.muted}
                    multiline
                    style={[styles.input, styles.notesInput]}
                  />
                </View>

                <AppButton
                  title={form.editingStatId ? "Update Entry" : "Save Entry"}
                  onPress={saveStat}
                />

                {form.editingStatId ? (
                  <Pressable onPress={resetForm}>
                    <Text style={styles.cancelText}>Cancel Edit</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>History</Text>

              {memberStats.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    No stats recorded yet. Add the first daily entry above.
                  </Text>
                </View>
              ) : (
                memberStats.map((stat) => (
                  <View key={stat.id} style={styles.statCard}>
                    <View>
                      <Text style={styles.statDate}>{stat.date}</Text>
                      <Text style={styles.statMeta}>
                        VS {stat.vsScore.toLocaleString()} · Donations{" "}
                        {stat.donations.toLocaleString()}
                      </Text>

                      {!!stat.notes?.trim() && (
                        <Text style={styles.notesText}>
                          {stat.notes.trim()}
                        </Text>
                      )}
                    </View>

                    <View style={styles.actionsRow}>
                      <SmallButton
                        title="Edit"
                        onPress={() => startEditingStat(stat)}
                      />
                      <SmallButton
                        title="Delete"
                        variant="danger"
                        onPress={() => confirmDeleteStat(stat)}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

function SmallButton({
  title,
  variant = "default",
  onPress,
}: {
  title: string;
  variant?: "default" | "danger";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.smallButton,
        variant === "danger" && styles.dangerButton,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.smallButtonText,
          variant === "danger" && styles.dangerButtonText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 18,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 4,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  summaryValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  weekGrid: {
    gap: 8,
  },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 4,
  },
  dayCardFilled: {
    borderColor: colors.primary,
  },
  dayDate: {
    color: colors.text,
    fontWeight: "900",
  },
  dayValue: {
    color: colors.muted,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: 12,
    fontWeight: "700",
  },
  notesInput: {
    minHeight: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  statDate: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  statMeta: {
    color: colors.muted,
    marginTop: 2,
    fontWeight: "700",
  },
  notesText: {
    color: colors.muted,
    lineHeight: 20,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  smallButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallButtonText: {
    color: colors.text,
    fontWeight: "900",
  },
  dangerButton: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  dangerButtonText: {
    color: "#b91c1c",
  },
  cancelText: {
    color: colors.muted,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyText: {
    color: colors.muted,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.65,
  },
});
