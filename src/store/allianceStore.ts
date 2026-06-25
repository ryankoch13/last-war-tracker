import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { demoEvents, demoMembers, demoTrains } from "../data/demoAlliance";
import type {
    AllianceEvent,
    AllianceMember,
    TrainAssignment,
} from "../types/alliance";
import { createId } from "../utils/createId";

type AllianceState = {
  members: AllianceMember[];
  events: AllianceEvent[];
  trains: TrainAssignment[];

  loadDemoData: () => void;
  clearAllData: () => void;

  addMember: (member: Omit<AllianceMember, "id">) => void;
  updateMember: (memberId: string, updates: Partial<AllianceMember>) => void;
  deleteMember: (memberId: string) => void;

  getMemberById: (memberId: string) => AllianceMember | undefined;
};

export const useAllianceStore = create<AllianceState>()(
  persist(
    (set, get) => ({
      members: [],
      events: [],
      trains: [],

      loadDemoData: () => {
        set({
          members: demoMembers,
          events: demoEvents,
          trains: demoTrains,
        });
      },

      clearAllData: () => {
        set({
          members: [],
          events: [],
          trains: [],
        });
      },

      addMember: (member) => {
        const newMember: AllianceMember = {
          ...member,
          id: createId("member"),
        };

        set((state) => ({
          members: [...state.members, newMember],
        }));
      },

      updateMember: (memberId, updates) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  ...updates,
                }
              : member,
          ),
        }));
      },

      deleteMember: (memberId) => {
        set((state) => ({
          members: state.members.filter((member) => member.id !== memberId),
          events: state.events.map((event) => ({
            ...event,
            assignedMemberIds: event.assignedMemberIds.filter(
              (id) => id !== memberId,
            ),
          })),
          trains: state.trains.map((train) => ({
            ...train,
            conductorId:
              train.conductorId === memberId ? undefined : train.conductorId,
            guardIds: train.guardIds.filter((id) => id !== memberId),
            passengerIds: train.passengerIds.filter((id) => id !== memberId),
          })),
        }));
      },

      getMemberById: (memberId) => {
        return get().members.find((member) => member.id === memberId);
      },
    }),
    {
      name: "alliance-ops-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
