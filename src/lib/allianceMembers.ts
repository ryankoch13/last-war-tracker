// lib/allianceMembers.ts
import { supabase } from "@/lib/supabase";

export type AllianceRole = "R1" | "R2" | "R3" | "R4" | "R5";

export type ActiveAllianceMember = {
  id: string;
  allianceId: string;
  userId: string;
  role: AllianceRole;
};

type AllianceMemberRow = {
  id: string;
  alliance_id: string;
  user_id: string;
  role: AllianceRole;
};

function mapAllianceMember(row: AllianceMemberRow): ActiveAllianceMember {
  return {
    id: row.id,
    allianceId: row.alliance_id,
    userId: row.user_id,
    role: row.role,
  };
}

export async function getActiveAllianceMember(
  allianceId: string,
): Promise<ActiveAllianceMember | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("alliance_users")
    .select("id, alliance_id, user_id, role")
    .eq("alliance_id", allianceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapAllianceMember(data as AllianceMemberRow);
}
