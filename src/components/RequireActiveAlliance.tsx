import { router } from "expo-router";
import { ReactNode } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useActiveAlliance } from "../hooks/useActiveAlliance";

type ActiveAllianceParams = {
  activeAllianceId: string;
  memberId: string;
};

type RequireActiveAllianceProps = {
  children: ReactNode | ((params: ActiveAllianceParams) => ReactNode);
};

export function RequireActiveAlliance({
  children,
}: RequireActiveAllianceProps) {
  const { loading, error, activeAllianceId, member, refresh, refreshing } =
    useActiveAlliance();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.message}>Loading alliance...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Could not load alliance</Text>
        <Text style={styles.message}>{error}</Text>

        <Pressable
          style={styles.button}
          onPress={refresh}
          disabled={refreshing}
        >
          <Text style={styles.buttonText}>
            {refreshing ? "Retrying..." : "Try Again"}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!activeAllianceId || !member) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>No alliance linked</Text>
        <Text style={styles.message}>
          Your account is not linked to an alliance member yet.
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => router.replace("/alliance-setup")}
        >
          <Text style={styles.buttonText}>Set Up Alliance</Text>
        </Pressable>
      </View>
    );
  }

  if (typeof children === "function") {
    return (
      <>
        {children({
          activeAllianceId,
          memberId: member.id,
        })}
      </>
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
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    opacity: 0.75,
    textAlign: "center",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#6d28d9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
});
