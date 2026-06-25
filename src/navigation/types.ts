import type { NavigatorScreenParams } from "@react-navigation/native";

export type MembersStackParamList = {
  MemberList: undefined;
  MemberDetail: {
    memberId: string;
  };
  EditMember: {
    memberId?: string;
  };
};

export type EventsStackParamList = {
  EventList: undefined;
};

export type TrainsStackParamList = {
  TrainBoard: undefined;
};

export type RootTabParamList = {
  Dashboard: undefined;
  Members: NavigatorScreenParams<MembersStackParamList>;
  Events: NavigatorScreenParams<EventsStackParamList>;
  Trains: NavigatorScreenParams<TrainsStackParamList>;
};
