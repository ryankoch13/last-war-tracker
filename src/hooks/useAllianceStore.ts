import { useAllianceStore } from "@/store/allianceStore";

export function useActiveAlliance() {
  return useAllianceStore((state) => state.activeAlliance);
}

export function useActiveAllianceId() {
  return useAllianceStore((state) => state.activeAllianceId);
}
