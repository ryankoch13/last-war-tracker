import { supabase } from "../lib/supabase";
import { getCurrentSupabaseUser } from "./auth";

export type AllianceMember = {
  id: string;
  alliance_id: string;
  user_id: string | null;
  name: string;
  role?: string | null;
  power?: number | null;
  level?: number | null;
  created_at?: string;
};

export async function getCurrentUserMember(allianceId: string) {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    throw new Error("You must be signed in to update your stats.");
  }

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("alliance_id", allianceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Your account is not linked to a member in this alliance.");
  }

  return data as AllianceMember;
}

export async function getAllianceMembers(allianceId: string) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("alliance_id", allianceId)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data as AllianceMember[];
}
