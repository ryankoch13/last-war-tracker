import { router, usePathname } from "expo-router";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useActiveAlliance } from "@/hooks/useActiveAlliance";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";

type RequireActiveAllianceProps = {
  children: ReactNode;
};

export function RequireActiveAlliance({
  children,
}: RequireActiveAllianceProps) {
  const pathname = usePathname();

  const { activeAllianceId, loadActiveAlliance } = useActiveAlliance();

  const [checking, setChecking] = useState(true);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) {
      return;
    }

    hasCheckedRef.current = true;

    const checkAlliance = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!user) {
          router.replace("/sign-in");
          return;
        }

        await loadActiveAlliance();
      } catch (error) {
        console.error("REQUIRE ACTIVE ALLIANCE ERROR:", error);
      } finally {
        setChecking(false);
      }
    };

    checkAlliance();
  }, [loadActiveAlliance]);

  useEffect(() => {
    if (checking) {
      return;
    }

    if (!activeAllianceId && pathname !== "/alliance-setup") {
      router.replace("/alliance-setup");
    }
  }, [activeAllianceId, checking, pathname]);

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Checking alliance...</Text>
      </View>
    );
  }

  if (!activeAllianceId) {
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 12,
  },
});
