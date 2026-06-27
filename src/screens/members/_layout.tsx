import { Stack } from "expo-router";

export default function MembersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Members" }} />
      <Stack.Screen name="[memberId]" options={{ title: "Member Detail" }} />
      <Stack.Screen name="edit" options={{ title: "Edit Member" }} />
    </Stack>
  );
}
