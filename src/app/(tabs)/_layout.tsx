import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, Tabs } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { useAuthSession } from "@/hooks/useAuthSession";
import { useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

function SettingsHeaderButton() {
  return (
    <Pressable
      onPress={() => router.push("/settings")}
      hitSlop={12}
      style={{ paddingHorizontal: 12 }}
    >
      <Ionicons name="settings-outline" size={24} color={colors.text} />
    </Pressable>
  );
}

export default function TabsLayout() {
  const { loading: authLoading, isSignedIn } = useAuthSession();

  const activeAllianceId = useAllianceStore((state) => state.activeAllianceId);
  const loadActiveAlliance = useAllianceStore(
    (state) => state.loadActiveAlliance,
  );

  const [checkingAlliance, setCheckingAlliance] = useState(true);
  const hasCheckedAllianceRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAlliance() {
      if (authLoading) {
        return;
      }

      if (!isSignedIn) {
        if (isMounted) {
          setCheckingAlliance(false);
        }
        return;
      }

      // If createAllianceAndMember already populated the store,
      // do not immediately reload and flash the layout.
      if (activeAllianceId) {
        if (isMounted) {
          setCheckingAlliance(false);
        }
        return;
      }

      // Prevent repeated loadActiveAlliance calls from layout re-renders.
      if (hasCheckedAllianceRef.current) {
        if (isMounted) {
          setCheckingAlliance(false);
        }
        return;
      }

      hasCheckedAllianceRef.current = true;

      try {
        setCheckingAlliance(true);
        await loadActiveAlliance();
      } catch (error) {
        console.error("TABS LOAD ACTIVE ALLIANCE ERROR:", error);
      } finally {
        if (isMounted) {
          setCheckingAlliance(false);
        }
      }
    }

    checkAlliance();

    return () => {
      isMounted = false;
    };
  }, [authLoading, isSignedIn, activeAllianceId, loadActiveAlliance]);

  if (authLoading || checkingAlliance) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  if (!activeAllianceId) {
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
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
