import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, useRouter } from "expo-router";

import { Pressable } from "react-native";
import { colors } from "../../theme/colors";

export default function TabsLayout() {
  const router = useRouter();

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
        headerRight: () => (
          <Pressable
            onPress={() => router.push("/settings")}
            hitSlop={10}
            style={({ pressed }) => ({
              marginRight: 16,
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Ionicons name="settings-outline" size={24} color="#111" />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          tabBarLabel: "Members",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="trains"
        options={{
          title: "Trains",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="train" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
