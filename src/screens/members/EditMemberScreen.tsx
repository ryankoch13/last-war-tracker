import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton } from "../../components/AppButton";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";
import type { AllianceRank, SquadType } from "../../types/alliance";

export function EditMemberScreen() {
  const router = useRouter();
  const { memberId } = useLocalSearchParams<{ memberId?: string }>();

  const existingMember = useAllianceStore((state) =>
    memberId ? state.getMemberById(memberId) : undefined,
  );
  const addMember = useAllianceStore((state) => state.addMember);
  const updateMember = useAllianceStore((state) => state.updateMember);

  const isEditing = !!existingMember;

  const [username, setUsername] = useState(existingMember?.username ?? "");
  const [rank, setRank] = useState<AllianceRank>(existingMember?.rank ?? "R3");
  const [power, setPower] = useState(existingMember?.power.toString() ?? "");
  const [hqLevel, setHqLevel] = useState(
    existingMember?.hqLevel.toString() ?? "",
  );
  const [mainSquad, setMainSquad] = useState<SquadType>(
    existingMember?.mainSquad ?? "Tank",
  );
  const [weeklyVsScore, setWeeklyVsScore] = useState(
    existingMember?.weeklyVsScore.toString() ?? "0",
  );
  const [weeklyDonations, setWeeklyDonations] = useState(
    existingMember?.weeklyDonations.toString() ?? "0",
  );
  const [notes, setNotes] = useState(existingMember?.notes ?? "");

  const title = useMemo(() => {
    return isEditing ? "Save Changes" : "Create Member";
  }, [isEditing]);

  function save() {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      Alert.alert("Missing username", "Add a username before saving.");
      return;
    }

    const parsedPower = Number(power);
    const parsedHq = Number(hqLevel);
    const parsedVs = Number(weeklyVsScore);
    const parsedDonations = Number(weeklyDonations);

    if (
      Number.isNaN(parsedPower) ||
      Number.isNaN(parsedHq) ||
      Number.isNaN(parsedVs) ||
      Number.isNaN(parsedDonations)
    ) {
      Alert.alert(
        "Invalid numbers",
        "Power, HQ, VS, and donations must be numbers.",
      );
      return;
    }

    const payload = {
      username: trimmedUsername,
      rank,
      power: parsedPower,
      hqLevel: parsedHq,
      mainSquad,
      weeklyVsScore: parsedVs,
      weeklyDonations: parsedDonations,
      notes: notes.trim(),
    };

    if (existingMember) {
      updateMember(existingMember.id, payload);
    } else {
      addMember(payload);
    }

    router.back();
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
          <Field label="Username" value={username} onChangeText={setUsername} />

          <Field
            label="Rank"
            value={rank}
            onChangeText={(value) => setRank(value as AllianceRank)}
          />
          <Text style={styles.helper}>Use R1, R2, R3, R4, or R5.</Text>

          <Field
            label="Power"
            value={power}
            onChangeText={setPower}
            keyboardType="number-pad"
          />

          <Field
            label="HQ Level"
            value={hqLevel}
            onChangeText={setHqLevel}
            keyboardType="number-pad"
          />

          <Field
            label="Main Squad"
            value={mainSquad}
            onChangeText={(value) => setMainSquad(value as SquadType)}
          />
          <Text style={styles.helper}>Use Tank, Air, Missile, or Mixed.</Text>

          <Field
            label="Weekly VS Score"
            value={weeklyVsScore}
            onChangeText={setWeeklyVsScore}
            keyboardType="number-pad"
          />

          <Field
            label="Weekly Donations"
            value={weeklyDonations}
            onChangeText={setWeeklyDonations}
            keyboardType="number-pad"
          />

          <Field
            label="R4 Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <AppButton title={title} onPress={save} />
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
});
