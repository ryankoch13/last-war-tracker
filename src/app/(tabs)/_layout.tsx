import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, Tabs } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";

import { useActiveAlliance } from "../../hooks/useActiveAlliance";
import { useAuthSession } from "../../hooks/useAuthSession";
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
        headerRight: () => <SettingsHeaderButton />,
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
        name="stats"
        options={{
          title: "My Stats",
        }}
      />
    </Tabs>
  );
}
