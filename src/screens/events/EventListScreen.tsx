import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { AllianceEvent, getAllianceEvents } from "@/lib/allianceEvents";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";
import { formatDateTime } from "../../utils/format";

export function EventListScreen() {
  const activeAllianceId = useAllianceStore((state) => state.activeAllianceId);

  const [events, setEvents] = useState<AllianceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadEvents() {
        if (!activeAllianceId) {
          setEvents([]);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);

          const results = await getAllianceEvents(activeAllianceId);

          if (isActive) {
            setEvents(results);
          }
        } catch (error) {
          console.error("Failed to load events", error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadEvents();

      return () => {
        isActive = false;
      };
    }, [activeAllianceId]),
  );

  return (
    <RequireActiveAlliance>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={events}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Pressable
            onPress={() => router.push("/events/create")}
            style={styles.createButton}
          >
            <Text style={styles.createButtonText}>+ Create Event</Text>
          </Pressable>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.empty}>
              No events yet. Create one for Desert Storm, Alliance Duel, Capital
              War, or custom reminders.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.type}</Text>
            <Text style={styles.meta}>
              Starts {formatDateTime(item.startsAt)}
            </Text>

            {!!item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}

            <Text style={styles.assigned}>
              Assigned members: {item.assignedMemberIds.length}
            </Text>
          </View>
        )}
      />
    </RequireActiveAlliance>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  meta: {
    color: colors.muted,
    fontWeight: "600",
  },
  description: {
    color: colors.text,
    lineHeight: 20,
    marginTop: 6,
  },
  assigned: {
    color: colors.primaryDark,
    fontWeight: "800",
    marginTop: 8,
  },
  empty: {
    color: colors.muted,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
