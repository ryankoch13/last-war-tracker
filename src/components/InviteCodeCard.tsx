import * as Clipboard from "expo-clipboard";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

type InviteCodeCardProps = {
  allianceName: string;
  inviteCode: string;
};

export function InviteCodeCard({
  allianceName,
  inviteCode,
}: InviteCodeCardProps) {
  async function handleCopy() {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert("Copied", "Invite code copied to clipboard.");
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Alliance</Text>
      <Text style={styles.title}>{allianceName}</Text>

      <Text style={styles.label}>Invite Code</Text>
      <Pressable onPress={handleCopy} style={styles.codeBox}>
        <Text style={styles.code}>{inviteCode}</Text>
      </Pressable>

      <Text style={styles.helperText}>
        Share this code with alliance members so they can join your tracker.
      </Text>

      <Pressable onPress={handleCopy} style={styles.button}>
        <Text style={styles.buttonText}>Copy Invite Code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.65,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  codeBox: {
    borderWidth: 1,
    borderColor: "#d8d0ff",
    backgroundColor: "#f8f5ff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  code: {
    color: "#6d28d9",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 3,
  },
  helperText: {
    fontSize: 14,
    opacity: 0.65,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#6d28d9",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "800",
  },
});
