import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { AppButton } from "../../components/AppButton";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";

export default function DailyStatsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    memberId?: string | string[];
    date?: string | string[];
  }>();

  const memberId = Array.isArray(params.memberId)
    ? params.memberId[0]
    : params.memberId;

  const routeDate = Array.isArray(params.date) ? params.date[0] : params.date;

  const members = useAllianceStore((state) => state.members ?? []);
  const dailyStats = useAllianceStore((state) => state.dailyStats ?? []);
  const saveDailyMemberStats = useAllianceStore(
    (state) => state.saveDailyMemberStats,
  );

  const member = useMemo(() => {
    if (!memberId) return undefined;

    return members.find((item) => item.id === memberId);
  }, [members, memberId]);

  const [date, setDate] = useState(routeDate ?? getTodayDateString());
  const [vsScore, setVsScore] = useState("");
  const [donations, setDonations] = useState("");
  const [saving, setSaving] = useState(false);

  const existingStatForDate = useMemo(() => {
    if (!memberId || !date) return undefined;

    return dailyStats.find(
      (stat) => stat.memberId === memberId && stat.date === date,
    );
  }, [dailyStats, memberId, date]);

  useEffect(() => {
    if (!existingStatForDate) {
      setVsScore("");
      setDonations("");
      return;
    }

    setVsScore(existingStatForDate.vsScore?.toString() ?? "");
    setDonations(existingStatForDate.donations?.toString() ?? "");
  }, [existingStatForDate]);

  async function save() {
    if (!memberId) {
      Alert.alert("Missing member", "No member was selected.");
      return;
    }

    if (!isValidDateString(date)) {
      Alert.alert("Invalid date", "Use the format YYYY-MM-DD.");
      return;
    }

    const parsedVsScore = parseNumberInput(vsScore);
    const parsedDonations = parseNumberInput(donations);

    if (Number.isNaN(parsedVsScore) || Number.isNaN(parsedDonations)) {
      Alert.alert(
        "Invalid numbers",
        "VS score and donations must be valid numbers.",
      );
      return;
    }

    try {
      setSaving(true);

      await saveDailyMemberStats({
        memberId,
        date,
        vsScore: parsedVsScore,
        donations: parsedDonations,
      });

      router.back();
    } catch (error) {
      console.error("SAVE DAILY STATS ERROR", error);
      Alert.alert("Error", "Could not save daily stats.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireActiveAlliance>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.select({
          ios: "padding",
          android: undefined,
        })}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerCard}>
            <Text style={styles.eyebrow}>Daily Stats</Text>
            <Text style={styles.title}>{member?.name ?? "Unknown Member"}</Text>
            <Text style={styles.description}>
              Add or update this member&apos;s VS score and alliance donations
              for a specific day.
            </Text>
          </View>

          <Field
            label="Date"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.helper}>
            Use YYYY-MM-DD, for example 2026-06-29.
          </Text>

          <Field
            label="VS Score"
            value={vsScore}
            onChangeText={setVsScore}
            placeholder="0"
            keyboardType="number-pad"
          />

          <Field
            label="Donations"
            value={donations}
            onChangeText={setDonations}
            placeholder="0"
            keyboardType="number-pad"
          />

          {existingStatForDate ? (
            <Text style={styles.existingText}>
              Stats already exist for this date. Saving will update that entry.
            </Text>
          ) : (
            <Text style={styles.existingText}>
              No stats found for this date yet. Saving will create a new entry.
            </Text>
          )}

          <AppButton
            title={saving ? "Saving..." : "Save Daily Stats"}
            onPress={save}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </RequireActiveAlliance>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
};

function Field({ label, style, ...props }: FieldProps) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        {...props}
      />
    </>
  );
}

function parseNumberInput(value: string) {
  return Number(value.replace(/,/g, "").trim() || 0);
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00`);

  return !Number.isNaN(parsedDate.getTime());
}

function getTodayDateString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 6,
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
  label: {
    color: colors.text,
    fontWeight: "800",
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
    marginTop: -6,
  },
  existingText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 4,
  },
});
