import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props = {
  label: string;
  value: string | number;
  helper?: string;
};

export function StatCard({ label, value, helper }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {!!helper && <Text style={styles.helper}>{helper}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flex: 1,
    gap: 6,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
  },
});
