import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { getAllianceMembers } from "@/services/allianceMembers";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";
import { formatCompactNumber } from "../../utils/format";

type AllianceMember = {
  id: string;
  alliance_id: string;
  user_id?: string | null;
  name?: string | null;
  username?: string | null;
  role?: string | null;
  power?: number | null;
  level?: number | null;
  weeklyVsScore?: number;
  weeklyDonations?: number;
};

export function MemberListScreen() {
  const router = useRouter();

  const alliance = useAllianceStore((state) => state.alliance);
  const allianceId = alliance?.id ?? null;

  const [members, setMembers] = useState<AllianceMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!allianceId) {
      return;
    }

    let isMounted = true;

    async function loadMembers() {
      try {
        setLoading(true);
        setErrorMessage("");

        const loadedMembers = await getAllianceMembers(allianceId);

        if (!isMounted) {
          return;
        }

        setMembers(loadedMembers ?? []);
      } catch (error) {
        console.error("LOAD MEMBERS ERROR:", error);

        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Could not load members.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [allianceId]);

  return (
    <RequireActiveAlliance>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Members</Text>
            <Text style={styles.subtitle}>
              Manage the roster for {alliance?.name ?? "your alliance"}.
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/members/create")}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.panel}>
            <ActivityIndicator />
            <Text style={styles.emptyText}>Loading members...</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.panel}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {!loading && members.length === 0 ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>No members yet</Text>
            <Text style={styles.panelText}>
              Add your alliance members to start tracking power, donations, and
              VS scores.
            </Text>
          </View>
        ) : null}

        {members.map((member) => {
          const displayName =
            member.name ?? member.username ?? "Unnamed Member";

          return (
            <View key={member.id} style={styles.memberCard}>
              <View>
                <Text style={styles.memberName}>{displayName}</Text>
                <Text style={styles.memberMeta}>
                  {member.role ?? "member"}
                  {member.level ? ` · Level ${member.level}` : ""}
                </Text>
              </View>

              <View style={styles.powerPill}>
                <Text style={styles.powerText}>
                  {formatCompactNumber(member.power ?? 0)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </RequireActiveAlliance>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    marginTop: 6,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "white",
    fontWeight: "800",
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  panelText: {
    color: colors.muted,
    lineHeight: 20,
  },
  emptyText: {
    color: colors.muted,
    textAlign: "center",
  },
  errorText: {
    color: "#DC2626",
    fontWeight: "700",
  },
  memberCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  memberName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  memberMeta: {
    color: colors.muted,
    marginTop: 4,
  },
  powerPill: {
    backgroundColor: "#ede9fe",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  powerText: {
    color: "#6d28d9",
    fontWeight: "800",
  },
});
