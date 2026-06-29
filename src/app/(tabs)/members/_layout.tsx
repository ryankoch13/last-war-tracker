import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

import { colors } from "../../../theme/colors";

function SettingsHeaderButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/settings")}
      hitSlop={10}
      style={({ pressed }) => ({
        marginRight: 16,
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <Ionicons name="settings-outline" size={22} color={colors.text} />
    </Pressable>
  );
}

export default function MembersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
          fontSize: 18,
          fontWeight: "800",
        },
        headerRight: () => <SettingsHeaderButton />,
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
