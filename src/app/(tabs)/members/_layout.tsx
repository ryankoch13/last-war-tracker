import { Stack } from "expo-router";

import { colors } from "../../../theme/colors";

export default function MembersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: "800",
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Members",
        }}
      />

      <Stack.Screen
        name="[memberId]"
        options={{
          title: "Member Detail",
        }}
      />

      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Member",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
