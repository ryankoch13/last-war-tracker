import { Stack, useRouter } from "expo-router";

function SettingsHeaderButton() {
  const router = useRouter();
}

export default function MembersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
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
        name="stats"
        options={{
          title: "Daily Stats",
        }}
      />

      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Member",
        }}
      />
    </Stack>
  );
}
