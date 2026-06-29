<<<<<<< HEAD
// app/(tabs)/members/stats.tsx

import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { colors } from "@/theme/colors";
import { RequireActiveAlliance } from "../../../components/RequireActiveAlliance";
import { useMyDailyStats } from "../../../hooks/useMyDailyStats";

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function onlyNumbers(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function MemberStatsScreen() {
  return (
    <RequireActiveAlliance>
      {({ activeAllianceId }) => (
        <MemberStatsContent allianceId={activeAllianceId} />
      )}
    </RequireActiveAlliance>
  );
}

type MemberStatsContentProps = {
  allianceId: string;
};

function MemberStatsContent({ allianceId }: MemberStatsContentProps) {
  const [date, setDate] = useState(getTodayDateString());
  const [donations, setDonations] = useState("");
  const [versusPoints, setVersusPoints] = useState("");

  const { stats, loading, saving, refreshing, error, refresh, saveStats } =
    useMyDailyStats(allianceId);

  const selectedEntry = useMemo(() => {
    return stats.find((row) => row.date === date) ?? null;
  }, [stats, date]);

  const recentStats = useMemo(() => {
    return [...stats].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
  }, [stats]);

  useEffect(() => {
    if (!selectedEntry) {
      setDonations("");
      setVersusPoints("");
      return;
    }

    setDonations(String(selectedEntry.donations ?? 0));
    setVersusPoints(String(selectedEntry.versus_points ?? 0));
  }, [selectedEntry]);

  async function handleSave() {
    const donationValue = Number(donations || 0);
    const versusValue = Number(versusPoints || 0);

    if (!date.trim()) {
      Alert.alert("Missing date", "Please enter a date.");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert("Invalid date", "Use the format YYYY-MM-DD.");
      return;
    }

    if (Number.isNaN(donationValue) || Number.isNaN(versusValue)) {
      Alert.alert("Invalid stats", "Please enter valid numbers.");
      return;
    }

    try {
      await saveStats({
        date,
        donations: donationValue,
        versusPoints: versusValue,
      });

      Alert.alert("Saved", "Your stats were updated.");
    } catch (err) {
      Alert.alert(
        "Could not save stats",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  }

  function handleSelectEntry(entryDate: string) {
    setDate(entryDate);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.mutedText}>Loading your stats...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Daily Stats</Text>
          <Text style={styles.subtitle}>
            Update your donations and VS points.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {selectedEntry ? "Edit Entry" : "New Entry"}
            </Text>

            {selectedEntry ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Existing</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.label}>Date</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Alliance Donations</Text>
          <TextInput
            value={donations}
            onChangeText={(value) => setDonations(onlyNumbers(value))}
            placeholder="0"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>VS Points</Text>
          <TextInput
            value={versusPoints}
            onChangeText={(value) => setVersusPoints(onlyNumbers(value))}
            placeholder="0"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={colors.muted}
          />

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveButton, saving && styles.disabledButton]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Stats"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard label="Entries" value={String(stats.length)} />

          <SummaryCard
            label="Total Donations"
            value={formatNumber(
              stats.reduce((total, row) => total + (row.donations ?? 0), 0),
            )}
          />

          <SummaryCard
            label="Total VS"
            value={formatNumber(
              stats.reduce((total, row) => total + (row.versus_points ?? 0), 0),
            )}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          <Text style={styles.mutedText}>Tap an entry to edit it.</Text>
        </View>

        {recentStats.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No stats yet</Text>
            <Text style={styles.mutedText}>
              Add today&apos;s donations and VS points to get started.
            </Text>
          </View>
        ) : (
          recentStats.map((entry) => (
            <Pressable
              key={`${entry.member_id}-${entry.date}`}
              style={[
                styles.entryCard,
                entry.date === date && styles.selectedEntryCard,
              ]}
              onPress={() => handleSelectEntry(entry.date)}
            >
              <View>
                <Text style={styles.entryDate}>{entry.date}</Text>
                <Text style={styles.mutedText}>
                  Donations: {formatNumber(entry.donations ?? 0)}
                </Text>
              </View>

              <View style={styles.entryRight}>
                <Text style={styles.entryPoints}>
                  {formatNumber(entry.versus_points ?? 0)}
                </Text>
                <Text style={styles.mutedText}>VS Points</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.65,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  badge: {
    backgroundColor: "#f3f0ff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: "#6d28d9",
    fontSize: 12,
    fontWeight: "800",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#6d28d9",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  disabledButton: {
    opacity: 0.55,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.65,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  entryCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedEntryCard: {
    borderColor: "#6d28d9",
    backgroundColor: "#f8f5ff",
  },
  entryDate: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  entryRight: {
    alignItems: "flex-end",
  },
  entryPoints: {
    fontSize: 18,
    fontWeight: "800",
  },
  mutedText: {
    fontSize: 14,
    opacity: 0.65,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  errorCard: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  errorTitle: {
    color: "#991b1b",
    fontWeight: "800",
  },
  errorText: {
    color: "#991b1b",
  },
});
=======
import { MemberStatsScreen } from "../../../screens/members/MemberStatsScreen";

export default function MemberStatsRoute() {
  return <MemberStatsScreen />;
}
>>>>>>> main
