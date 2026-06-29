import { AllianceRole, useAllianceStore } from "@/store/allianceStore";
import { useEffect } from "react";

export function useActiveAlliance() {
  const activeAllianceId = useAllianceStore((state) => state.activeAllianceId);
  const activeAlliance = useAllianceStore((state) => state.activeAlliance);
  const allianceUser = useAllianceStore((state) => state.allianceUser);

  const members = useAllianceStore((state) => state.members ?? []);
  const dailyStats = useAllianceStore((state) => state.dailyStats ?? []);
  const trainAssignments = useAllianceStore(
    (state) => state.trainAssignments ?? [],
  );
  const events = useAllianceStore((state) => state.events ?? []);

  const loading = useAllianceStore((state) => state.loading);
  const error = useAllianceStore((state) => state.error);
  const hasLoaded = useAllianceStore((state) => state.hasLoaded);
  const loadActiveAlliance = useAllianceStore(
    (state) => state.loadActiveAlliance,
  );

  useEffect(() => {
    if (!hasLoaded && !loading) {
      void loadActiveAlliance();
    }
  }, [hasLoaded, loading, loadActiveAlliance]);

  return {
    activeAllianceId,
    activeAlliance,
    allianceUser,

    members,
    dailyStats,
    trainAssignments,
    events,

    loading,
    error,
    hasLoaded,

    hasActiveAlliance: Boolean(activeAllianceId && activeAlliance),

    canManageAlliance:
      allianceUser?.role === AllianceRole.R4 ||
      allianceUser?.role === AllianceRole.R5,
  };
}

export function useActiveAllianceId() {
  return useAllianceStore((state) => state.activeAllianceId);
}

export function useAllianceUser() {
  return useAllianceStore((state) => state.allianceUser);
}

export function useCanManageAlliance() {
  const allianceUser = useAllianceStore((state) => state.allianceUser);

  const role = allianceUser?.role?.toUpperCase();

  return (
    role === AllianceRole.R4 ||
    role === AllianceRole.R5 ||
    role === "ADMIN" ||
    role === "OWNER"
  );
}
