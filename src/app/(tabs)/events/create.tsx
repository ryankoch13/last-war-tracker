import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { createAllianceEvent } from "@/lib/allianceEvents";
import { useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

const eventTypes = [
  "Desert Storm",
  "Alliance Duel",
  "Capital War",
  "Bounty Hunter",
  "Train",
  "Custom",
];

export default function CreateEventRoute() {
  const activeAllianceId = useAllianceStore((state) => state.activeAllianceId);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("Custom");
  const [startsAt, setStartsAt] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreateEvent() {
    if (!activeAllianceId) {
      Alert.alert("Missing alliance", "Please select an alliance first.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter an event title.");
      return;
    }

    const parsedDate = new Date(startsAt);

    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert(
        "Invalid date",
        "Please enter the date like this: 2026-06-28T20:00",
      );
      return;
    }

    try {
      setSaving(true);

      await createAllianceEvent({
        allianceId: activeAllianceId,
        title: title.trim(),
        type,
        startsAt: parsedDate.toISOString(),
        description: description.trim() || null,
        assignedMemberIds: [],
      });

      router.back();
    } catch (error) {
      console.error("Failed to create event", error);
      Alert.alert("Could not create event", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireActiveAlliance>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Create Event</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Example: Desert Storm signup"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Event Type</Text>

            <View style={styles.chipRow}>
              {eventTypes.map((eventType) => {
                const selected = type === eventType;

                return (
                  <Pressable
                    key={eventType}
                    onPress={() => setType(eventType)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.chipTextSelected,
                      ]}
                    >
                      {eventType}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Starts At</Text>
            <TextInput
              value={startsAt}
              onChangeText={setStartsAt}
              placeholder="2026-06-28T20:00"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              style={styles.input}
            />
            <Text style={styles.helperText}>Use format: YYYY-MM-DDTHH:mm</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add reminders, signup notes, or alliance instructions."
              placeholderTextColor={colors.muted}
              multiline
              style={[styles.input, styles.textArea]}
            />
          </View>

          <Pressable
            onPress={handleCreateEvent}
            disabled={saving}
            style={[styles.createButton, saving && styles.createButtonDisabled]}
          >
            <Text style={styles.createButtonText}>
              {saving ? "Creating..." : "Create Event"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </RequireActiveAlliance>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 18,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  field: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  helperText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.muted,
    fontWeight: "800",
  },
  chipTextSelected: {
    color: "#fff",
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
});
