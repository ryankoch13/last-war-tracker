import { supabase } from "../lib/supabase";
import { getCurrentSupabaseUser } from "./auth";

function generateInviteCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < length; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

export async function createAllianceAndMember(
  allianceName: string,
  memberName: string,
) {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    throw new Error("You must be signed in to create an alliance.");
  }

  const cleanAllianceName = allianceName.trim();
  const cleanMemberName = memberName.trim();

  if (!cleanAllianceName) {
    throw new Error("Alliance name is required.");
  }

  if (!cleanMemberName) {
    throw new Error("Member name is required.");
  }

  const { data: alliance, error: allianceError } = await supabase
    .from("alliances")
    .insert({
      name: cleanAllianceName,
      created_by: user.id,
      invite_code: generateInviteCode(),
    })
    .select("*")
    .single();

  if (allianceError) {
    throw allianceError;
  }

  const { error: allianceUserError } = await supabase
    .from("alliance_users")
    .upsert(
      {
        alliance_id: alliance.id,
        user_id: user.id,
        role: "owner",
      },
      {
        onConflict: "alliance_id,user_id",
      },
    );

  if (allianceUserError) {
    throw allianceUserError;
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      alliance_id: alliance.id,
      user_id: user.id,
      name: cleanMemberName,
      role: "owner",
      power: 0,
      level: null,
    })
    .select("*")
    .single();

  if (memberError) {
    throw memberError;
  }

  return {
    alliance,
    member,
  };
}

export async function joinAllianceAndClaimMember(
  inviteCode: string,
  memberName: string,
) {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    throw new Error("You must be signed in to join an alliance.");
  }

  const cleanInviteCode = inviteCode.trim().toUpperCase();
  const cleanMemberName = memberName.trim();

  if (!cleanInviteCode) {
    throw new Error("Invite code is required.");
  }

  if (!cleanMemberName) {
    throw new Error("Member name is required.");
  }

  const { data: alliance, error: allianceError } = await supabase
    .from("alliances")
    .select("*")
    .eq("invite_code", cleanInviteCode)
    .maybeSingle();

  if (allianceError) {
    throw allianceError;
  }

  if (!alliance) {
    throw new Error("Alliance not found. Check the invite code.");
  }

  const { error: allianceUserError } = await supabase
    .from("alliance_users")
    .upsert(
      {
        alliance_id: alliance.id,
        user_id: user.id,
        role: "member",
      },
      {
        onConflict: "alliance_id,user_id",
      },
    );

  if (allianceUserError) {
    throw allianceUserError;
  }

  const { data: existingMember, error: existingMemberError } = await supabase
    .from("members")
    .select("*")
    .eq("alliance_id", alliance.id)
    .ilike("name", cleanMemberName)
    .maybeSingle();

  if (existingMemberError) {
    throw existingMemberError;
  }

  if (existingMember) {
    if (existingMember.user_id && existingMember.user_id !== user.id) {
      throw new Error("That member profile has already been claimed.");
    }

    const { data: claimedMember, error: claimError } = await supabase
      .from("members")
      .update({
        user_id: user.id,
      })
      .eq("id", existingMember.id)
      .select("*")
      .single();

    if (claimError) {
      throw claimError;
    }

    return {
      alliance,
      member: claimedMember,
    };
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      alliance_id: alliance.id,
      user_id: user.id,
      name: cleanMemberName,
      role: "member",
      power: 0,
      level: null,
    })
    .select("*")
    .single();

  if (memberError) {
    throw memberError;
  }

  return {
    alliance,
    member,
  };
}
