import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  createAllianceAndMember,
  joinAllianceByInviteCode,
} from "@/lib/allianceSetup";
import { supabase } from "@/lib/supabase";
import { AllianceRole, useAllianceStore } from "@/store/allianceStore";
import { colors } from "@/theme/colors";

type SetupMode = "create" | "join";
type JoinStep = "invite" | "claim";

type UnclaimedMember = {
  id: string;
  name: string;
  role: AllianceRole;
  power: number;
  level: number;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function formatRole(role: AllianceRole | string) {
  return String(role).toUpperCase();
}

function isLeaderRole(role: AllianceRole | string | null | undefined) {
  const normalizedRole = String(role ?? "").toLowerCase();

  return (
    normalizedRole === AllianceRole.R4 || normalizedRole === AllianceRole.R5
  );
}

function formatPower(power: number | null | undefined) {
  const safePower = power ?? 0;

  if (safePower >= 1_000_000) {
    return `${(safePower / 1_000_000).toFixed(1)}M`;
  }

  if (safePower >= 1_000) {
    return `${(safePower / 1_000).toFixed(1)}K`;
  }

  return safePower.toLocaleString();
}

function normalizeUnclaimedMembers(data: unknown): UnclaimedMember[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as {
        id?: unknown;
        name?: unknown;
        role?: unknown;
        power?: unknown;
        level?: unknown;
      };

      if (typeof row.id !== "string" || typeof row.name !== "string") {
        return null;
      }

      return {
        id: row.id,
        name: row.name,
        role: String(row.role ?? AllianceRole.R1).toLowerCase() as AllianceRole,
        power:
          typeof row.power === "number" ? row.power : Number(row.power ?? 0),
        level:
          row.level === null || row.level === undefined
            ? null
            : Number(row.level),
      };
    })
    .filter((member): member is UnclaimedMember => member !== null);
}

export default function AllianceSetupScreen() {
  const [mode, setMode] = useState<SetupMode>("create");

  const [allianceName, setAllianceName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [memberName, setMemberName] = useState("");

  const [joinStep, setJoinStep] = useState<JoinStep>("invite");
  const [unclaimedMembers, setUnclaimedMembers] = useState<UnclaimedMember[]>(
    [],
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [leaderCode, setLeaderCode] = useState("");
  const [showCreateFallback, setShowCreateFallback] = useState(false);

  const [loading, setLoading] = useState(false);

  const loadActiveAlliance = useAllianceStore(
    (state) => state.loadActiveAlliance,
  );

  const selectedMember = useMemo(() => {
    if (!selectedMemberId) {
      return null;
    }

    return (
      unclaimedMembers.find((member) => member.id === selectedMemberId) ?? null
    );
  }, [selectedMemberId, unclaimedMembers]);

  const selectedMemberNeedsLeaderCode = isLeaderRole(selectedMember?.role);

  function handleModeChange(nextMode: SetupMode) {
    setMode(nextMode);

    if (nextMode === "join") {
      return;
    }

    resetJoinClaimState();
  }

  function resetJoinClaimState() {
    setJoinStep("invite");
    setUnclaimedMembers([]);
    setSelectedMemberId(null);
    setLeaderCode("");
    setShowCreateFallback(false);
  }

  async function finishSetup() {
    await loadActiveAlliance();
    router.replace("/(tabs)");
  }

  async function handleCreateAlliance() {
    const trimmedAllianceName = allianceName.trim();
    const trimmedMemberName = memberName.trim();

    if (!trimmedAllianceName) {
      Alert.alert("Missing Alliance Name", "Please enter an alliance name.");
      return;
    }

    if (!trimmedMemberName) {
      Alert.alert("Missing Name", "Please enter your in-game name.");
      return;
    }

    try {
      setLoading(true);

      await createAllianceAndMember(trimmedAllianceName, trimmedMemberName);
      await finishSetup();
    } catch (error) {
      console.error("ALLIANCE SETUP ERROR:", error);
      Alert.alert("Could Not Complete Setup", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleLookupInviteCode() {
    const trimmedInviteCode = inviteCode.trim();

    if (!trimmedInviteCode) {
      Alert.alert("Missing Invite Code", "Please enter an invite code.");
      return;
    }

    try {
      setLoading(true);
      setSelectedMemberId(null);
      setLeaderCode("");
      setShowCreateFallback(false);

      const { data, error } = await supabase.rpc(
        "get_unclaimed_members_for_invite",
        {
          p_invite_code: trimmedInviteCode,
        },
      );

      if (error) {
        throw error;
      }

      setUnclaimedMembers(normalizeUnclaimedMembers(data));
      setJoinStep("claim");
    } catch (error) {
      console.error("INVITE LOOKUP ERROR:", error);
      Alert.alert("Could Not Find Alliance", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleClaimSelectedMember() {
    const trimmedInviteCode = inviteCode.trim();

    if (!trimmedInviteCode) {
      Alert.alert("Missing Invite Code", "Please enter an invite code.");
      return;
    }

    if (!selectedMember) {
      Alert.alert(
        "Select Your Member",
        "Choose your in-game name from the roster list.",
      );
      return;
    }

    if (selectedMemberNeedsLeaderCode && !leaderCode.trim()) {
      Alert.alert(
        "Leader Code Required",
        "Enter the R4/R5 claim code to join as this member.",
      );
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.rpc("join_alliance_and_claim_member", {
        p_invite_code: trimmedInviteCode,
        p_member_id: selectedMember.id,
        p_leader_code: selectedMemberNeedsLeaderCode ? leaderCode.trim() : null,
      });

      if (error) {
        throw error;
      }

      await finishSetup();
    } catch (error) {
      console.error("CLAIM MEMBER ERROR:", error);
      Alert.alert("Could Not Join Alliance", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinAsNewMember() {
    const trimmedInviteCode = inviteCode.trim();
    const trimmedMemberName = memberName.trim();

    if (!trimmedInviteCode) {
      Alert.alert("Missing Invite Code", "Please enter an invite code.");
      return;
    }

    if (!trimmedMemberName) {
      Alert.alert("Missing Name", "Please enter your in-game name.");
      return;
    }

    try {
      setLoading(true);

      await joinAllianceByInviteCode(trimmedInviteCode, trimmedMemberName);
      await finishSetup();
    } catch (error) {
      console.error("JOIN ALLIANCE ERROR:", error);
      Alert.alert("Could Not Join Alliance", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function renderCreateForm() {
    return (
      <>
        <Text style={styles.label}>Alliance Name</Text>
        <TextInput
          value={allianceName}
          onChangeText={setAllianceName}
          placeholder="Alliance name"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!loading}
          style={styles.input}
        />

        <Text style={styles.label}>Your In-Game Name</Text>
        <TextInput
          value={memberName}
          onChangeText={setMemberName}
          placeholder="Your in-game name"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!loading}
          style={styles.input}
        />

        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleCreateAlliance}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitButtonText}>Create Alliance</Text>
          )}
        </Pressable>
      </>
    );
  }

  function renderInviteStep() {
    return (
      <>
        <Text style={styles.label}>Invite Code</Text>
        <TextInput
          value={inviteCode}
          onChangeText={(value) => {
            setInviteCode(value);
            resetJoinClaimState();
          }}
          placeholder="Invite code"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!loading}
          style={styles.input}
        />

        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleLookupInviteCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitButtonText}>Continue</Text>
          )}
        </Pressable>
      </>
    );
  }

  function renderClaimStep() {
    return (
      <>
        <View style={styles.claimHeader}>
          <Text style={styles.claimTitle}>Choose Your Roster Member</Text>
          <Text style={styles.claimSubtitle}>
            Select your existing in-game name. This links your app account to
            the roster member your R4/R5 already added.
          </Text>
        </View>

        {unclaimedMembers.length > 0 ? (
          <View style={styles.memberList}>
            {unclaimedMembers.map((member) => {
              const selected = selectedMemberId === member.id;
              const leaderMember = isLeaderRole(member.role);

              return (
                <Pressable
                  key={member.id}
                  style={[
                    styles.memberOption,
                    selected && styles.memberOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedMemberId(member.id);
                    setLeaderCode("");
                  }}
                  disabled={loading}
                >
                  <View style={styles.memberOptionTopRow}>
                    <Text
                      style={[
                        styles.memberName,
                        selected && styles.memberNameSelected,
                      ]}
                    >
                      {member.name}
                    </Text>

                    <View
                      style={[
                        styles.roleBadge,
                        leaderMember && styles.leaderRoleBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleBadgeText,
                          leaderMember && styles.leaderRoleBadgeText,
                        ]}
                      >
                        {formatRole(member.role)}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.memberMeta,
                      selected && styles.memberMetaSelected,
                    ]}
                  >
                    HQ {member.level ?? "?"} · {formatPower(member.power)} power
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyRosterCard}>
            <Text style={styles.emptyRosterTitle}>No unclaimed members</Text>
            <Text style={styles.emptyRosterText}>
              Your alliance may not have any roster-only members yet, or every
              listed member has already claimed their account.
            </Text>
          </View>
        )}

        {selectedMemberNeedsLeaderCode ? (
          <View style={styles.leaderCodeCard}>
            <Text style={styles.label}>R4/R5 Claim Code</Text>
            <TextInput
              value={leaderCode}
              onChangeText={setLeaderCode}
              placeholder="Enter leader claim code"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              editable={!loading}
              style={styles.input}
            />
            <Text style={styles.helperText}>
              This code is required because you selected an R4/R5 roster member.
            </Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleClaimSelectedMember}
          disabled={loading || !selectedMember}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitButtonText}>Join as Selected Member</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            setJoinStep("invite");
            setSelectedMemberId(null);
            setLeaderCode("");
            setShowCreateFallback(false);
          }}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Back to Invite Code</Text>
        </Pressable>

        <View style={styles.divider} />

        {!showCreateFallback ? (
          <Pressable
            style={styles.linkButton}
            onPress={() => setShowCreateFallback(true)}
            disabled={loading}
          >
            <Text style={styles.linkButtonText}>I’m not listed</Text>
          </Pressable>
        ) : (
          <View style={styles.fallbackCard}>
            <Text style={styles.fallbackTitle}>Join as a New Member</Text>
            <Text style={styles.fallbackText}>
              Use this only if your R4/R5 has not added you to the roster yet.
              This will create a new R1 roster profile.
            </Text>

            <Text style={styles.label}>Your In-Game Name</Text>
            <TextInput
              value={memberName}
              onChangeText={setMemberName}
              placeholder="Your in-game name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
              style={styles.input}
            />

            <Pressable
              style={[
                styles.outlineSubmitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleJoinAsNewMember}
              disabled={loading}
            >
              <Text style={styles.outlineSubmitButtonText}>
                Join and Create New Roster Member
              </Text>
            </Pressable>
          </View>
        )}
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Set Up Your Alliance</Text>
          <Text style={styles.subtitle}>
            Create a new alliance or join an existing one with an invite code.
          </Text>
        </View>

        <View style={styles.modeRow}>
          <Pressable
            style={[
              styles.modeButton,
              mode === "create" && styles.modeButtonActive,
            ]}
            onPress={() => handleModeChange("create")}
            disabled={loading}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === "create" && styles.modeButtonTextActive,
              ]}
            >
              Create
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeButton,
              mode === "join" && styles.modeButtonActive,
            ]}
            onPress={() => handleModeChange("join")}
            disabled={loading}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === "join" && styles.modeButtonTextActive,
              ]}
            >
              Join
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {mode === "create"
            ? renderCreateForm()
            : joinStep === "invite"
              ? renderInviteStep()
              : renderClaimStep()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  modeRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "700",
  },
  modeButtonTextActive: {
    color: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    color: colors.inputText,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "800",
  },
  claimHeader: {
    marginBottom: 14,
  },
  claimTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  claimSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  memberList: {
    marginBottom: 14,
  },
  memberOption: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
    marginBottom: 10,
  },
  memberOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  memberOptionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  memberName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
    paddingRight: 10,
  },
  memberNameSelected: {
    color: colors.primaryDark,
  },
  memberMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  memberMetaSelected: {
    color: colors.primaryDark,
  },
  roleBadge: {
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  roleBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  leaderRoleBadge: {
    backgroundColor: "rgba(220, 38, 38, 0.12)",
  },
  leaderRoleBadgeText: {
    color: colors.danger,
  },
  leaderCodeCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
    marginBottom: 12,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -8,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },
  linkButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  linkButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
  },
  fallbackCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
  },
  fallbackTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  fallbackText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  outlineSubmitButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  outlineSubmitButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyRosterCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
    marginBottom: 14,
  },
  emptyRosterTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyRosterText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
