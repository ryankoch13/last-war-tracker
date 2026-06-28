import { create } from "zustand";

import { supabase } from "../lib/supabase";
import { getCurrentSupabaseUser } from "../services/auth";

type Alliance = {
  id: string;
  name: string;
  created_by: string;
  invite_code: string | null;
  created_at?: string;
};

type AllianceUser = {
  alliance_id: string;
  user_id: string;
  role: string;
};

type AllianceStore = {
  alliance: Alliance | null;
  allianceUser: AllianceUser | null;
  loading: boolean;
  hasLoaded: boolean;
  error: string | null;

  loadAlliance: (force?: boolean) => Promise<void>;
  clearAlliance: () => void;
};

export const useAllianceStore = create<AllianceStore>((set, get) => ({
  alliance: null,
  allianceUser: null,
  loading: false,
  hasLoaded: false,
  error: null,

  loadAlliance: async (force = false) => {
    const { loading, hasLoaded } = get();

    if (loading) {
      return;
    }

    if (hasLoaded && !force) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const user = await getCurrentSupabaseUser();

      if (!user) {
        set({
          alliance: null,
          allianceUser: null,
          loading: false,
          hasLoaded: true,
          error: null,
        });
        return;
      }

      const { data, error } = await supabase
        .from("alliance_users")
        .select(
          `
          alliance_id,
          user_id,
          role,
          alliance:alliances (
            id,
            name,
            created_by,
            invite_code,
            created_at
          )
        `,
        )
        .eq("user_id", user.id)
        .limit(1);

      if (error) {
        throw error;
      }

      const allianceUser = data?.[0];

      if (!allianceUser) {
        set({
          alliance: null,
          allianceUser: null,
          loading: false,
          hasLoaded: true,
          error: null,
        });
        return;
      }

      set({
        alliance: allianceUser.alliance as Alliance,
        allianceUser: {
          alliance_id: allianceUser.alliance_id,
          user_id: allianceUser.user_id,
          role: allianceUser.role,
        },
        loading: false,
        hasLoaded: true,
        error: null,
      });
    } catch (error) {
      console.error("LOAD ALLIANCE ERROR:", error);

      set({
        alliance: null,
        allianceUser: null,
        loading: false,
        hasLoaded: true,
        error:
          error instanceof Error ? error.message : "Could not load alliance.",
      });
    }
  },

  clearAlliance: () => {
    set({
      alliance: null,
      allianceUser: null,
      loading: false,
      hasLoaded: false,
      error: null,
    });
  },
}));
