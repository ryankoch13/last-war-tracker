import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { useActiveAlliance } from "@/hooks/useActiveAlliance";
import { AllianceEvent, getAllianceEvents } from "@/lib/allianceEvents";
import { AllianceRole } from "@/store/allianceStore";
import { colors } from "@/theme/colors";
import { formatDateTime } from "@/utils/format";

export function EventListScreen() {
  const { activeAllianceId, allianceUser } = useActiveAlliance();

  const [events, setEvents] = useState<AllianceEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canManageAlliance =
    allianceUser?.role === AllianceRole.R4 ||
    allianceUser?.role === AllianceRole.R5;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadScreenData() {
        if (!activeAllianceId) {
          setEvents([]);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setErrorMessage("");

          const eventResults = await getAllianceEvents(activeAllianceId);

          if (isActive) {
            setEvents(eventResults ?? []);
          }
        } catch (error) {
          console.error("Failed to load event screen data", error);

          if (isActive) {
            setErrorMessage(
              error instanceof Error ? error.message : "Could not load events.",
            );
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadScreenData();

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
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Events</Text>
            <Text style={styles.subtitle}>
              Track alliance events, reminders, and assignments.
            </Text>

            {errorMessage ? (
              <View style={styles.errorPanel}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingPanel}>
              <ActivityIndicator />
              <Text style={styles.empty}>Loading events...</Text>
            </View>
          ) : (
            <Text style={styles.empty}>
              No events yet. Alliance managers can create alliance events.
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
  header: {
    gap: 10,
    marginBottom: 4,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    lineHeight: 20,
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
  loadingPanel: {
    alignItems: "center",
    gap: 8,
    padding: 16,
  },
  errorPanel: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  errorText: {
    color: "#DC2626",
    fontWeight: "700",
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
