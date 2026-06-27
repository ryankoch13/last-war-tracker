import { Stack } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useAllianceStore } from "../store/allianceStore";

export default function SettingsScreen() {
  const [isClearModalVisible, setIsClearModalVisible] = useState(false);

  const loadDemoData = useAllianceStore((state) => state.loadDemoData);
  const clearAllData = useAllianceStore((state) => state.clearAllData);

  const membersCount = useAllianceStore((state) => state.members.length);
  const eventsCount = useAllianceStore((state) => state.events.length);
  const trainsCount = useAllianceStore((state) => state.trains.length);

  const handleLoadDemoData = () => {
    loadDemoData();
  };

  const handleConfirmClear = () => {
    clearAllData();
    setIsClearModalVisible(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />

      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alliance Data</Text>

          <Text style={styles.cardDescription}>
            Manage your saved alliance members, events, and train assignments.
          </Text>

          <View style={styles.statsContainer}>
            <Text style={styles.statText}>Members: {membersCount}</Text>
            <Text style={styles.statText}>Events: {eventsCount}</Text>
            <Text style={styles.statText}>Trains: {trainsCount}</Text>
          </View>

          <Pressable
            onPress={handleLoadDemoData}
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Load demo alliance</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsClearModalVisible(true)}
            style={({ pressed }) => [
              styles.button,
              styles.dangerButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.dangerButtonText}>Clear alliance data</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={isClearModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsClearModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Clear alliance data?</Text>

            <Text style={styles.modalDescription}>
              This will permanently delete your saved members, events, and train
              assignments from this device.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setIsClearModalVisible(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelModalButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmClear}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.confirmModalButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.confirmModalButtonText}>Clear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f8",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111827",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6b7280",
    marginBottom: 16,
  },
  statsContainer: {
    gap: 6,
    marginBottom: 18,
  },
  statText: {
    fontSize: 15,
    color: "#374151",
  },
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  dangerButton: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  dangerButtonText: {
    color: "#b91c1c",
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6b7280",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelModalButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "700",
  },
  confirmModalButton: {
    backgroundColor: "#dc2626",
  },
  confirmModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
