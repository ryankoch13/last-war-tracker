import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";
import { useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

type RouterTarget = Parameters<typeof router.replace>[0];

const LOGIN_ROUTE = "/login" as RouterTarget;
const ALLIANCE_SETUP_ROUTE = "/alliance-setup" as RouterTarget;
const TABS_ROUTE = "/(tabs)" as RouterTarget;

export default function IndexScreen() {
  const [loading, setLoading] = useState(true);

  const loadActiveAlliance = useAllianceStore(
    (state) => state.loadActiveAlliance,
  );
  const clearActiveAlliance = useAllianceStore(
    (state) => state.clearActiveAlliance,
  );

  useEffect(() => {
    let mounted = true;

    async function routeForCurrentSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          clearActiveAlliance();

          if (mounted) {
            router.replace(LOGIN_ROUTE);
          }

          return;
        }

        await loadActiveAlliance();

        const { activeAllianceId } = useAllianceStore.getState();

        if (!mounted) return;

        if (activeAllianceId) {
          router.replace(TABS_ROUTE);
        } else {
          router.replace(ALLIANCE_SETUP_ROUTE);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void routeForCurrentSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        clearActiveAlliance();
        router.replace(LOGIN_ROUTE);
        return;
      }

      void loadActiveAlliance().then(() => {
        const { activeAllianceId } = useAllianceStore.getState();

        if (activeAllianceId) {
          router.replace(TABS_ROUTE);
        } else {
          router.replace(ALLIANCE_SETUP_ROUTE);
        }
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clearActiveAlliance, loadActiveAlliance]);

  if (!loading) {
    return null;
  }

  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.message}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  message: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 14,
  },
});
