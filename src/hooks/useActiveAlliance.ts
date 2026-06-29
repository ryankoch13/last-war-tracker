import { useMemo } from "react";

import { useAllianceStore } from "@/store/allianceStore";

export function useActiveAlliance() {
  const activeAllianceId = useAllianceStore((state) => state.activeAllianceId);
  const activeAlliance = useAllianceStore((state) => state.activeAlliance);
  const allianceUser = useAllianceStore((state) => state.allianceUser);
  const loading = useAllianceStore((state) => state.loading);
  const error = useAllianceStore((state) => state.error);

  const loadActiveAlliance = useAllianceStore(
    (state) => state.loadActiveAlliance,
  );

  const clearAlliance = useAllianceStore((state) => state.clearAlliance);

  const role = allianceUser?.role ?? null;
  const normalizedRole = role?.toUpperCase() ?? null;

  const canManageAlliance =
    normalizedRole === "R4" ||
    normalizedRole === "R5" ||
    normalizedRole === "ADMIN" ||
    normalizedRole === "OWNER";

  return useMemo(
    () => ({
      activeAllianceId,
      activeAlliance,
      allianceUser,
      loading,
      error,
      role,
      normalizedRole,
      canManageAlliance,
      loadActiveAlliance,
      clearAlliance,
    }),
    [
      activeAllianceId,
      activeAlliance,
      allianceUser,
      loading,
      error,
      role,
      normalizedRole,
      canManageAlliance,
      loadActiveAlliance,
      clearAlliance,
    ],
  );
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

  return role === "R4" || role === "R5" || role === "ADMIN" || role === "OWNER";
}
