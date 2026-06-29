import { ScrollView, StyleSheet, Text, View } from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";

export default function StatsScreen() {
  const alliance = useAllianceStore((state) => state.alliance);

  return (
    <RequireActiveAlliance>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View>
          <Text style={styles.title}>My Stats</Text>
          <Text style={styles.subtitle}>
            Track your daily VS score, donations, and alliance participation.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Active Alliance</Text>
          <Text style={styles.panelText}>{alliance?.name ?? "—"}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Daily Stats</Text>
          <Text style={styles.panelText}>
            This screen is ready to be rebuilt for daily VS score and donation
            entry.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Coming Back Next</Text>
          <Text style={styles.panelText}>
            We can reconnect this to your daily_member_stats table so each
            member can add or edit stats by day.
          </Text>
        </View>
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
    gap: 18,
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
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
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
});
