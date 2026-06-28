export type AllianceRank = "R1" | "R2" | "R3" | "R4" | "R5";

export type SquadType = "Tank" | "Air" | "Missile" | "Mixed";

export type AllianceMember = {
  id: string;
  username: string;
  alliance_id: string;
  rank: AllianceRank;
  power: number;
  hqLevel: number;
  mainSquad: SquadType;
  timezone?: string;
  lastActiveAt?: string;
  weeklyVsScore: number;
  weeklyDonations: number;
  notes?: string;
};

export type ActiveAllianceState = {
  userId: string | null;
  member: AllianceMember | null;
  activeAllianceId: string | null;
};

export type AllianceEventType =
  | "Desert Storm"
  | "Alliance Duel"
  | "Capital War"
  | "Train"
  | "Rare Soil War"
  | "Custom";

export type AllianceEvent = {
  id: string;
  title: string;
  type: AllianceEventType;
  startsAt: string;
  description?: string;
  assignedMemberIds: string[];
};

export type TrainAssignment = {
  id: string;
  trainName: string;
  departureTime: string;
  conductorId?: string;
  guardIds: string[];
  passengerIds: string[];
  notes?: string;
};
