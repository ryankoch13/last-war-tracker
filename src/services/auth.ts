import { supabase } from "../lib/supabase";

export async function getCurrentSupabaseUser() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.user) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  return user;
}

export async function resendConfirmationEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error("Email is required.");
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: cleanEmail,
  });

  if (error) {
    throw error;
  }
}
