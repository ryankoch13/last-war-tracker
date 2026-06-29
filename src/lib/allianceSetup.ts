import { supabase } from "@/lib/supabase";

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

  const joinedAlliance = Array.isArray(data) ? data[0] : data;

  return joinedAlliance?.alliance_id as string | undefined;
}
