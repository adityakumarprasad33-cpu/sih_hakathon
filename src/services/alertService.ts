import { ref, onValue, off, update, get } from "firebase/database";
import { database, isFirebaseConfigured } from "@/lib/firebase/config";
import type { HealthAlert } from "@/types/alert";

export const alertService = {
  /**
   * Subscribe to alerts for the authenticated patient
   * Path: /alerts/{uid}
   */
  subscribeToAlerts(
    uid: string,
    onAlerts: (alerts: HealthAlert[]) => void
  ): () => void {
    if (!isFirebaseConfigured() || !database) {
      onAlerts([]);
      return () => {};
    }

    const alertsRef = ref(database, `alerts/${uid}`);
    let unsubscribe = () => {};
    try {
      unsubscribe = onValue(
        alertsRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            onAlerts([]);
            return;
          }
          const raw = snapshot.val();
          const list: HealthAlert[] = Object.keys(raw).map((key) => ({
            id: key,
            ...raw[key],
          }));
          // Sort newest first
          onAlerts(list.sort((a, b) => b.timestamp - a.timestamp));
        },
        (error) => {
          console.warn("Alerts subscription listener warning:", error.message);
          onAlerts([]);
        }
      );
    } catch {
      onAlerts([]);
    }

    return () => {
      try {
        unsubscribe();
      } catch {
        off(alertsRef);
      }
    };
  },

  /**
   * Mark alert as acknowledged
   */
  async acknowledgeAlert(uid: string, alertId: string): Promise<void> {
    if (!database) return;
    await update(ref(database, `alerts/${uid}/${alertId}`), {
      status: "ACKNOWLEDGED",
    });
  },
};
