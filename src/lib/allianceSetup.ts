import { supabase } from "@/lib/supabase";

type AllianceSetupResult = {
  alliance_id?: string;
  allianceId?: string;
  member_role?: string;
  role?: string;
};

function getFirstRpcRow(data: unknown): AllianceSetupResult | null {
  if (Array.isArray(data)) {
    return (data[0] as AllianceSetupResult | undefined) ?? null;
  }

  if (data && typeof data === "object") {
    return data as AllianceSetupResult;
  }

  return null;
}

export async function createAllianceAndMember(
  allianceName: string,
  memberName: string,
) {
  const trimmedAllianceName = allianceName.trim();
  const trimmedMemberName = memberName.trim();

  if (!trimmedAllianceName) {
    throw new Error("Alliance name is required.");
  }

  if (!trimmedMemberName) {
    throw new Error("Member name is required.");
  }

  const { data, error } = await supabase.rpc("create_alliance_and_member", {
    p_alliance_name: trimmedAllianceName,
    p_member_name: trimmedMemberName,
  });

  if (error) {
    throw error;
  }

  const createdAlliance = getFirstRpcRow(data);

  return (
    createdAlliance?.alliance_id ?? createdAlliance?.allianceId ?? undefined
  );
}

export async function joinAllianceByInviteCode(
  inviteCode: string,
  memberName: string,
) {
  const trimmedInviteCode = inviteCode.trim();
  const trimmedMemberName = memberName.trim();

  if (!trimmedInviteCode) {
    throw new Error("Invite code is required.");
  }

  if (!trimmedMemberName) {
    throw new Error("Member name is required.");
  }

  const { data, error } = await supabase.rpc("join_alliance_by_invite_code", {
    p_invite_code: trimmedInviteCode,
    p_member_name: trimmedMemberName,
  });

  if (error) {
    throw error;
  }

  const joinedAlliance = getFirstRpcRow(data);

  return joinedAlliance?.alliance_id ?? joinedAlliance?.allianceId ?? undefined;
}
