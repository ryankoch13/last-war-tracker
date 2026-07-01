import { useEffect } from "react";

import { AllianceRole, useAllianceStore } from "@/store/allianceStore";

function canRoleManageAlliance(role?: AllianceRole | string | null) {
  return role === AllianceRole.R4 || role === AllianceRole.R5;
}

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

  const currentMember = members.find(
    (member) => member.userId && member.userId === allianceUser?.userId,
  );

  const currentRole = currentMember?.role ?? allianceUser?.role ?? null;

  return {
    activeAllianceId,
    activeAlliance,
    allianceUser,
    currentMember,
    currentRole,
    members,
    dailyStats,
    trainAssignments,
    events,
    loading,
    error,
    hasLoaded,
    hasActiveAlliance: Boolean(activeAllianceId && activeAlliance),
    canManageAlliance: canRoleManageAlliance(currentRole),
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
  const role = allianceUser?.role;

  return role === AllianceRole.R4 || role === AllianceRole.R5;
}
