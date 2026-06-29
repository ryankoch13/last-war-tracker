import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { Pressable } from "react-native";

import { RequireActiveAlliance } from "@/components/RequireActiveAlliance";
import { colors } from "@/theme/colors";

type TabBarIconProps = {
  color: string;
  size: number;
};

function SettingsButton() {
  return (
    <Pressable
      onPress={() => router.push("/settings")}
      style={({ pressed }) => ({
        paddingHorizontal: 16,
        opacity: pressed ? 0.6 : 1,
      })}
      hitSlop={12}
    >
      <MaterialCommunityIcons
        name="cog-outline"
        size={24}
        color={colors.text}
      />
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <RequireActiveAlliance>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitleStyle: {
            color: colors.text,
            fontWeight: "800",
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerRight: () => <SettingsButton />,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: "rgba(0,0,0,0.08)",
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "700",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              <MaterialCommunityIcons
                name="view-dashboard-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="members"
          options={{
            title: "Members",
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              <MaterialCommunityIcons
                name="account-group-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="trains"
          options={{
            title: "Trains",
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              <MaterialCommunityIcons name="train" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="events"
          options={{
            title: "Events",
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              <MaterialCommunityIcons
                name="calendar-star"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="stats"
          options={{
            title: "Stats",
            tabBarIcon: ({ color, size }: TabBarIconProps) => (
              <MaterialCommunityIcons
                name="chart-line"
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </RequireActiveAlliance>
  );
}
