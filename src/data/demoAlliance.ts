import type {
    AllianceEvent,
    AllianceMember,
    TrainAssignment,
} from "../types/alliance";

export const demoMembers: AllianceMember[] = [
  {
    id: "member_1",
    username: "RallyKing",
    rank: "R5",
    power: 92300000,
    hqLevel: 30,
    mainSquad: "Tank",
    timezone: "EST",
    lastActiveAt: new Date().toISOString(),
    weeklyVsScore: 58200000,
    weeklyDonations: 82000,
    notes: "Usually online around reset. Main Desert Storm caller.",
  },
  {
    id: "member_2",
    username: "AirQueen",
    rank: "R4",
    power: 77100000,
    hqLevel: 29,
    mainSquad: "Air",
    timezone: "CST",
    lastActiveAt: new Date().toISOString(),
    weeklyVsScore: 43800000,
    weeklyDonations: 64000,
    notes: "Strong air squad. Good for second lane assignments.",
  },
  {
    id: "member_3",
    username: "TankDad",
    rank: "R3",
    power: 64500000,
    hqLevel: 28,
    mainSquad: "Tank",
    timezone: "PST",
    lastActiveAt: new Date().toISOString(),
    weeklyVsScore: 22700000,
    weeklyDonations: 35000,
    notes: "Needs reminders for donations.",
  },
  {
    id: "member_4",
    username: "MissileMike",
    rank: "R3",
    power: 58900000,
    hqLevel: 27,
    mainSquad: "Missile",
    timezone: "EST",
    lastActiveAt: new Date().toISOString(),
    weeklyVsScore: 19400000,
    weeklyDonations: 28000,
  },
];

export const demoEvents: AllianceEvent[] = [
  {
    id: "event_1",
    title: "Desert Storm Prep",
    type: "Desert Storm",
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    description: "Assign lanes, reserves, callers, and reminders.",
    assignedMemberIds: ["member_1", "member_2"],
  },
  {
    id: "event_2",
    title: "Alliance Duel Push",
    type: "Alliance Duel",
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    description: "Save stamina, shards, speedups, and drone parts.",
    assignedMemberIds: ["member_1", "member_3", "member_4"],
  },
];

export const demoTrains: TrainAssignment[] = [
  {
    id: "train_1",
    trainName: "Gold Train 1",
    departureTime: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
    conductorId: "member_1",
    guardIds: ["member_2"],
    passengerIds: ["member_3", "member_4"],
    notes: "Main alliance train. Ping 15 minutes before departure.",
  },
  {
    id: "train_2",
    trainName: "Reserve Train",
    departureTime: new Date(Date.now() + 1000 * 60 * 150).toISOString(),
    guardIds: [],
    passengerIds: [],
  },
];
