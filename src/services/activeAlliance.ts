// src/services/activeAlliance.ts

import { supabase } from "../lib/supabase";
import { ActiveAllianceState, AllianceMember } from "../types/alliance";
import { getCurrentSupabaseUser } from "./auth";

export async function getActiveAllianceState(): Promise<ActiveAllianceState> {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    return {
      userId: null,
      member: null,
      activeAllianceId: null,
    };
  }

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const member = data as AllianceMember | null;

  return {
    userId: user.id,
    member,
    activeAllianceId: member?.alliance_id ?? null,
  };
}
