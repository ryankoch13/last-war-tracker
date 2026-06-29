<<<<<<< HEAD
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, Tabs } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";

import { useActiveAlliance } from "../../hooks/useActiveAlliance";
import { useAuthSession } from "../../hooks/useAuthSession";
=======
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, useRouter } from "expo-router";

import { Pressable } from "react-native";
>>>>>>> main
import { colors } from "../../theme/colors";

function SettingsHeaderButton() {
  return (
    <Pressable
      onPress={() => router.push("/settings")}
      hitSlop={12}
      style={{ paddingHorizontal: 12 }}
    >
      <Ionicons name="settings-outline" size={24} color="#111827" />
    </Pressable>
  );
}

export default function TabsLayout() {
<<<<<<< HEAD
  const { loading: authLoading, isSignedIn } = useAuthSession();
  const {
    loading: allianceLoading,
    hasLoaded: allianceHasLoaded,
    hasActiveAlliance,
  } = useActiveAlliance();

  if (authLoading || allianceLoading || !allianceHasLoaded) {
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
=======
  const router = useRouter();
>>>>>>> main

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
<<<<<<< HEAD
        headerRight: () => <SettingsHeaderButton />,
=======
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
>>>>>>> main
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
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="events/index"
        options={{
          title: "Events",
          tabBarLabel: "Events",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="trains/index"
        options={{
          title: "Trains",
          tabBarLabel: "Trains",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="train-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="events/create"
        options={{
          href: null,
          title: "Create Event",
        }}
      />

      <Tabs.Screen
        name="trains/create"
        options={{
          href: null,
          title: "Create Train",
        }}
      />
    </Tabs>
  );
}
