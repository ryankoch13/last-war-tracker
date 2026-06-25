import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "../../components/AppButton";
import { MemberCard } from "../../components/MemberCard";
import { useAllianceStore } from "../../store/allianceStore";
import { colors } from "../../theme/colors";

export function MemberListScreen() {
  const router = useRouter();
  const members = useAllianceStore((state) => state.members);
  const [query, setQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return members
      .filter((member) => {
        if (!normalizedQuery) return true;

        return (
          member.username.toLowerCase().includes(normalizedQuery) ||
          member.rank.toLowerCase().includes(normalizedQuery) ||
          member.mainSquad.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => b.power - a.power);
  }, [members, query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search members, rank, squad..."
          placeholderTextColor={colors.muted}
          style={styles.search}
        />

        <AppButton title="Add" onPress={() => router.push("/members/edit")} />
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No members yet</Text>
            <Text style={styles.emptyText}>
              Load demo data from the Dashboard or add your first member.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MemberCard
            member={item}
            onPress={() => router.push(`/members/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
  },
  search: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    color: colors.text,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    gap: 6,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 18,
  },
  emptyText: {
    color: colors.muted,
    lineHeight: 20,
  },
});
