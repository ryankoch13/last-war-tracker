import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { supabase } from "@/lib/supabase";
import { useAllianceStore } from "@/store/allianceStore";

export function useAllianceRealtimeRefresh() {
  const activeAllianceId = useAllianceStore((state) => state.activeAllianceId);
  const loadActiveAlliance = useAllianceStore(
    (state) => state.loadActiveAlliance,
  );

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!activeAllianceId) return;

    function queueRefresh() {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(() => {
        void loadActiveAlliance();
      }, 300);
    }

    const channel = supabase
      .channel(`alliance-${activeAllianceId}-changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "members",
          filter: `alliance_id=eq.${activeAllianceId}`,
        },
        queueRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alliance_users",
          filter: `alliance_id=eq.${activeAllianceId}`,
        },
        queueRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_member_stats",
          filter: `alliance_id=eq.${activeAllianceId}`,
        },
        queueRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "train_assignments",
          filter: `alliance_id=eq.${activeAllianceId}`,
        },
        queueRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alliance_events",
          filter: `alliance_id=eq.${activeAllianceId}`,
        },
        queueRefresh,
      )
      .subscribe((status, error) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("ALLIANCE REALTIME ERROR:", status, error);
        }
      });

    function handleAppStateChange(nextState: AppStateStatus) {
      if (nextState === "active") {
        void loadActiveAlliance();
      }
    }

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      appStateSubscription.remove();
      void supabase.removeChannel(channel);
    };
  }, [activeAllianceId, loadActiveAlliance]);
}
