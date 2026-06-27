import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { demoEvents, demoMembers, demoTrains } from "../data/demoAlliance";
import type {
  AllianceEvent,
  AllianceMember,
  DailyMemberStat,
  TrainAssignment,
} from "../types/alliance";
import { createId } from "../utils/createId";

type AllianceState = {
  members: AllianceMember[];
  events: AllianceEvent[];
  trains: TrainAssignment[];
  dailyStats: DailyMemberStat[];

  loadDemoData: () => void;
  clearAllData: () => void;

  addMember: (member: Omit<AllianceMember, "id">) => void;
  updateMember: (memberId: string, updates: Partial<AllianceMember>) => void;
  deleteMember: (memberId: string) => void;

  upsertDailyStat: (
    memberId: string,
    date: string,
    updates: Partial<Pick<DailyMemberStat, "weeklyVs" | "donations">>,
  ) => void;

  deleteDailyStat: (statId: string) => void;

  getMemberById: (memberId: string) => AllianceMember | undefined;
  getDailyStatsByMemberId: (memberId: string) => DailyMemberStat[];
  addTrainAssignment: () => void;
  updateTrainAssignment: (
    trainId: string,
    updates: Partial<TrainAssignment>,
  ) => void;
  completeTrainAssignment: (trainId: string) => void;
  reopenTrainAssignment: (trainId: string) => void;
  deleteTrainAssignment: (trainId: string) => void;
  addAllianceEvent: (event: {
    name: string;
    type: AllianceEvent["type"];
    date: string;
    notes?: string;
    assignedMemberIds?: string[];
  }) => void;

  updateAllianceEvent: (
    eventId: string,
    updates: Partial<AllianceEvent>,
  ) => void;

  completeAllianceEvent: (eventId: string) => void;
  reopenAllianceEvent: (eventId: string) => void;
  deleteAllianceEvent: (eventId: string) => void;
};

export const useAllianceStore = create<AllianceState>()(
  persist(
    (set, get) => ({
      members: [],
      events: [],
      trains: [],
      dailyStats: [],

      loadDemoData: () => {
        set({
          members: demoMembers,
          events: demoEvents,
          trains: demoTrains,
          dailyStats: [],
        });
      },

      clearAllData: () => {
        set({
          members: [],
          events: [],
          trains: [],
          dailyStats: [],
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

          dailyStats: state.dailyStats.filter(
            (stat) => stat.memberId !== memberId,
          ),

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

      upsertDailyStat: (memberId, date, updates) => {
        set((state) => {
          const existingStat = state.dailyStats.find(
            (stat) => stat.memberId === memberId && stat.date === date,
          );

          if (existingStat) {
            return {
              dailyStats: state.dailyStats.map((stat) =>
                stat.id === existingStat.id
                  ? {
                      ...stat,
                      ...updates,
                    }
                  : stat,
              ),
            };
          }

          return {
            dailyStats: [
              ...state.dailyStats,
              {
                id: createId("daily-stat"),
                memberId,
                date,
                weeklyVs: updates.weeklyVs ?? 0,
                donations: updates.donations ?? 0,
              },
            ],
          };
        });
      },

      deleteDailyStat: (statId) => {
        set((state) => ({
          dailyStats: state.dailyStats.filter((stat) => stat.id !== statId),
        }));
      },

      getMemberById: (memberId) => {
        return get().members.find((member) => member.id === memberId);
      },

      getDailyStatsByMemberId: (memberId) => {
        return get()
          .dailyStats.filter((stat) => stat.memberId === memberId)
          .sort((a, b) => b.date.localeCompare(a.date));
      },
      addTrainAssignment: () => {
        const today = new Date().toISOString().slice(0, 10);

        set((state) => ({
          trains: [
            ...state.trains,
            {
              id: createId("train"),
              name: `Train ${state.trains.length + 1}`,
              date: today,
              status: "active",
              guardIds: [],
              passengerIds: [],
            },
          ],
        }));
      },

      updateTrainAssignment: (trainId, updates) => {
        set((state) => ({
          trains: state.trains.map((train) =>
            train.id === trainId
              ? {
                  ...train,
                  ...updates,
                }
              : train,
          ),
        }));
      },

      completeTrainAssignment: (trainId) => {
        const today = new Date().toISOString().slice(0, 10);

        set((state) => ({
          trains: state.trains.map((train) =>
            train.id === trainId
              ? {
                  ...train,
                  status: "completed",
                  completedAt: today,
                }
              : train,
          ),
        }));
      },

      reopenTrainAssignment: (trainId) => {
        set((state) => ({
          trains: state.trains.map((train) =>
            train.id === trainId
              ? {
                  ...train,
                  status: "active",
                  completedAt: undefined,
                }
              : train,
          ),
        }));
      },

      deleteTrainAssignment: (trainId) => {
        set((state) => ({
          trains: state.trains.filter((train) => train.id !== trainId),
        }));
      },
      addAllianceEvent: (event) => {
        set((state) => ({
          events: [
            ...state.events,
            {
              id: createId("event"),
              name: event.name,
              type: event.type,
              date: event.date,
              notes: event.notes,
              assignedMemberIds: event.assignedMemberIds ?? [],
              status: "active",
            },
          ],
        }));
      },

      updateAllianceEvent: (eventId, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  ...updates,
                }
              : event,
          ),
        }));
      },

      completeAllianceEvent: (eventId) => {
        const today = new Date().toISOString().slice(0, 10);

        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  status: "completed",
                  completedAt: today,
                }
              : event,
          ),
        }));
      },

      reopenAllianceEvent: (eventId) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  status: "active",
                  completedAt: undefined,
                }
              : event,
          ),
        }));
      },

      deleteAllianceEvent: (eventId) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== eventId),
        }));
      },
    }),

    {
      name: "alliance-ops-store",
      storage: createJSONStorage(() => AsyncStorage),

      version: 2,

      migrate: (persistedState) => {
        const state = persistedState as Partial<AllianceState>;

        return {
          members: state.members ?? [],
          events: state.events ?? [],
          trains: state.trains ?? [],
          dailyStats: state.dailyStats ?? [],
        };
      },

      partialize: (state) => ({
        members: state.members,
        events: state.events,
        trains: state.trains,
        dailyStats: state.dailyStats,
      }),
    },
  ),
);
