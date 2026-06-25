import { Tabs } from "expo-router";

import { colors } from "../../theme/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: "800",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
        }}
      />

      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
        }}
      />

      <Tabs.Screen
        name="trains"
        options={{
          title: "Trains",
        }}
      />
    </Tabs>
  );
}
