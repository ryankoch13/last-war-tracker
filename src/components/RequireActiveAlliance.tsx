import { router } from "expo-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useActiveAlliance } from "@/hooks/useActiveAlliance";
import { colors } from "@/theme/colors";

type RequireActiveAllianceProps = {
  children: ReactNode;
};

type RouterTarget = Parameters<typeof router.replace>[0];

const ALLIANCE_SETUP_ROUTE = "/alliance-setup" as RouterTarget;

export function RequireActiveAlliance({
  children,
}: RequireActiveAllianceProps) {
  const { loading, hasLoaded, hasActiveAlliance, error } = useActiveAlliance();

  useEffect(() => {
    if (hasLoaded && !loading && !error && !hasActiveAlliance) {
      router.replace(ALLIANCE_SETUP_ROUTE);
    }
  }, [hasLoaded, loading, error, hasActiveAlliance]);

  if (loading || !hasLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.message}>Loading alliance...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Could not load alliance</Text>
        <Text style={styles.message}>{error}</Text>
      </View>
    );
  }

  if (!hasActiveAlliance) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.message}>Redirecting to alliance setup...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
  },
});
