import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Redirect, Stack, Tabs } from "expo-router";

import { useActiveAlliance } from "@/hooks/useActiveAlliance";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../../theme/colors";

export default function TabsLayout() {
  const { loading: authLoading, isSignedIn } = useAuthSession();
  const { loading: allianceLoading, hasActiveAlliance } = useActiveAlliance();

  if (authLoading || allianceLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }
  if (!hasActiveAlliance) {
    return <Redirect href="/alliance-setup" />;
  }
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          headerShown: false,
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
      <Stack.Screen
        name="stats"
        options={{
          title: "My Stats",
        }}
      />
    </Tabs>
  );
}
