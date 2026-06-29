// src/services/alliances.ts

import { supabase } from "../lib/supabase";

export type Alliance = {
  id: string;
  name: string;
  invite_code: string;
};

function getSupabaseErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return JSON.stringify(error);
}

export async function getAllianceById(allianceId: string): Promise<Alliance> {
  const { data, error } = await supabase
    .from("alliances")
    .select("id, name, invite_code")
    .eq("id", allianceId)
    .maybeSingle();

  if (error) {
    console.log("GET ALLIANCE ERROR:", error);
    throw new Error(getSupabaseErrorMessage(error));
  }

  if (!data) {
    throw new Error(
      "Alliance not found or you do not have permission to view it.",
    );
  }

  return data;
}
