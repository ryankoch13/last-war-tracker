import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useActiveAlliance } from "../hooks/useActiveAlliance";

type RequireActiveAllianceProps = {
  children: React.ReactNode;
};

export function RequireActiveAlliance({
  children,
}: RequireActiveAllianceProps) {
  const { loading, hasLoaded, hasActiveAlliance } = useActiveAlliance();

  if (loading || !hasLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!hasActiveAlliance) {
    return <Redirect href="/alliance-setup" />;
  }

  return <>{children}</>;
}
