import { ref, onValue, off, get, query, orderByKey, limitToLast, startAt, endAt } from "firebase/database";
import { database, isFirebaseConfigured } from "@/lib/firebase/config";
import type { HealthTelemetry, TelemetryState } from "@/types/health";

export const LIVE_DATA_THRESHOLD_MS = 60 * 1000; // 60 seconds for live freshness
export const STALE_DATA_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before marked offline

export const healthService = {
  /**
   * Subscribe to authenticated real-time live telemetry stream in Firebase RTDB
   * Path: /telemetry/{uid}/live
   * 
   * ZERO FAKE DATA:
   * Returns honest dynamic connection states (LOADING, CONNECTED, STALE, DISCONNECTED/OFFLINE, EMPTY).
   */
  subscribeToLiveTelemetry(
    uid: string,
    onStateChange: (state: TelemetryState) => void
  ): () => void {
    if (!isFirebaseConfigured() || !database || !uid) {
      onStateChange({
        status: "EMPTY",
        data: null,
      });
      return () => {};
    }

    const liveRef = ref(database, `telemetry/${uid}/live`);
    let latestData: HealthTelemetry | null = null;

    onStateChange({ status: "LOADING", data: null });

    // Transition to honest EMPTY state after 2.5s if no stream data packet exists
    const initialTimeout = setTimeout(() => {
      if (!latestData) {
        onStateChange({
          status: "EMPTY",
          data: null,
        });
      }
    }, 2500);

    const computeFreshness = (data: HealthTelemetry | null): "CONNECTED" | "STALE" | "DISCONNECTED" => {
      if (!data || !data.timestamp) return "DISCONNECTED";
      const elapsed = Date.now() - data.timestamp;
      if (elapsed <= LIVE_DATA_THRESHOLD_MS) {
        return "CONNECTED";
      } else if (elapsed <= STALE_DATA_THRESHOLD_MS) {
        return "STALE";
      } else {
        return "DISCONNECTED";
      }
    };

    let unsubscribe = () => {};

    try {
      unsubscribe = onValue(
        liveRef,
        (snapshot) => {
          clearTimeout(initialTimeout);
          if (!snapshot.exists()) {
            latestData = null;
            onStateChange({
              status: "EMPTY",
              data: null,
            });
            return;
          }

          const raw = snapshot.val() as HealthTelemetry;
          latestData = raw;
          const status = computeFreshness(raw);

          onStateChange({
            status,
            data: raw,
            lastUpdated: raw.timestamp,
          });
        },
        (error) => {
          clearTimeout(initialTimeout);
          console.warn("Live telemetry listener notification:", error.message);
          onStateChange({
            status: "EMPTY",
            data: null,
          });
        }
      );
    } catch {
      clearTimeout(initialTimeout);
      onStateChange({
        status: "EMPTY",
        data: null,
      });
    }

    // Dynamic ticker to evaluate freshness transitions without page reload
    const ticker = setInterval(() => {
      if (latestData) {
        const currentStatus = computeFreshness(latestData);
        onStateChange({
          status: currentStatus,
          data: latestData,
          lastUpdated: latestData.timestamp,
        });
      }
    }, 2000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(ticker);
      try {
        unsubscribe();
      } catch {
        off(liveRef);
      }
    };
  },

  /**
   * Query historical telemetry records for trend charts and clinical analysis.
   * Checks /telemetry/{uid}/history and falls back to /telemetryHistory/{uid}.
   * NEVER generates fake charts. Returns empty array if no records exist.
   */
  async getTelemetryHistory(
    uid: string,
    startTime?: number,
    endTime?: number,
    limit: number = 100
  ): Promise<HealthTelemetry[]> {
    if (!isFirebaseConfigured() || !database || !uid) {
      return [];
    }

    try {
      // 1. First probe primary historical path: /telemetry/{uid}/history
      const primaryRef = ref(database, `telemetry/${uid}/history`);
      let primaryQuery;

      if (startTime && endTime) {
        primaryQuery = query(
          primaryRef,
          orderByKey(),
          startAt(String(startTime)),
          endAt(String(endTime)),
          limitToLast(limit)
        );
      } else if (startTime) {
        primaryQuery = query(
          primaryRef,
          orderByKey(),
          startAt(String(startTime)),
          limitToLast(limit)
        );
      } else {
        primaryQuery = query(primaryRef, orderByKey(), limitToLast(limit));
      }

      const snap = await get(primaryQuery);
      if (snap.exists()) {
        const raw = snap.val();
        const list: HealthTelemetry[] = Object.values(raw);
        return list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      }

      // 2. Fallback probe: /telemetryHistory/{uid}
      const fallbackRef = ref(database, `telemetryHistory/${uid}`);
      let fallbackQuery;

      if (startTime && endTime) {
        fallbackQuery = query(
          fallbackRef,
          orderByKey(),
          startAt(String(startTime)),
          endAt(String(endTime)),
          limitToLast(limit)
        );
      } else {
        fallbackQuery = query(fallbackRef, orderByKey(), limitToLast(limit));
      }

      const fallbackSnap = await get(fallbackQuery);
      if (fallbackSnap.exists()) {
        const rawFallback = fallbackSnap.val();
        const list: HealthTelemetry[] = Object.values(rawFallback);
        return list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      }

      return [];
    } catch (err) {
      console.warn("Error fetching telemetry history:", err);
      return [];
    }
  },
};

