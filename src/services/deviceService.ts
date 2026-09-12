import { ref, get, set, remove, update } from "firebase/database";
import { database, isFirebaseConfigured } from "@/lib/firebase/config";
import type { SamadhanDevice, DeviceConnectionState } from "@/types/device";

const DEVICE_ONLINE_THRESHOLD_MS = 60 * 1000; // 60 seconds
const DEVICE_STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export const deviceService = {
  /**
   * Fetch registered wearable devices for a patient from /userDevices/{uid} and /devices/{deviceId}.
   * Resolves honest connection states based on last seen timestamp from mobile app sync.
   */
  async getUserDevices(uid: string): Promise<SamadhanDevice[]> {
    if (!isFirebaseConfigured() || !database) {
      return [];
    }

    try {
      const timeoutPromise = new Promise<SamadhanDevice[]>((resolve) =>
        setTimeout(() => resolve([]), 2500)
      );

      const fetchPromise = (async () => {
        const userDevicesRef = ref(database, `userDevices/${uid}`);
        const snapshot = await get(userDevicesRef);
        if (!snapshot.exists()) {
          return [];
        }

        const deviceMap = snapshot.val();
        const devices: SamadhanDevice[] = [];
        const now = Date.now();

        for (const deviceId of Object.keys(deviceMap)) {
          const mapping = deviceMap[deviceId];
          const devSnapshot = await get(ref(database, `devices/${deviceId}`));

          if (devSnapshot.exists()) {
            const devData = devSnapshot.val();
            const lastSeen = devData.lastSeen || mapping.pairedAt || 0;
            const elapsed = now - lastSeen;

            let computedState: DeviceConnectionState = "OFFLINE";
            if (!lastSeen || lastSeen === 0) {
              computedState = "WAITING_FOR_DEVICE";
            } else if (elapsed <= DEVICE_ONLINE_THRESHOLD_MS) {
              computedState = "CONNECTED";
            } else if (elapsed <= DEVICE_STALE_THRESHOLD_MS) {
              computedState = "STALE";
            } else {
              computedState = "OFFLINE";
            }

            devices.push({
              id: deviceId,
              name: mapping.customName || devData.name || "Samadhan Band",
              model: devData.model || "Samadhan Health Wearable (ESP32-S3)",
              firmwareVersion: devData.firmwareVersion || "v1.0.0-esp32s3",
              batteryPercent: devData.batteryPercent,
              lastSeen,
              connectionState: computedState,
              macAddress: devData.macAddress,
              ownerUid: devData.ownerUid || uid,
              sensors: devData.sensors || {
                max30102: "INITIALIZED",
                mpu6050: "INITIALIZED",
                dht22: "INITIALIZED",
              },
              lastTelemetryTimestamp: devData.lastTelemetryTimestamp || lastSeen,
              pairedAt: mapping.pairedAt || devData.pairedAt || lastSeen,
            });
          } else {
            // Entry exists in userDevices but devices/ has not been updated yet
            devices.push({
              id: deviceId,
              name: mapping.customName || "Samadhan Wearable",
              model: "Samadhan Health Wearable (ESP32-S3)",
              firmwareVersion: "v1.0.0-esp32s3",
              lastSeen: mapping.pairedAt || now,
              connectionState: "WAITING_FOR_DEVICE",
              ownerUid: uid,
              pairedAt: mapping.pairedAt || now,
              sensors: {
                max30102: "INITIALIZED",
                mpu6050: "INITIALIZED",
                dht22: "INITIALIZED",
              },
            });
          }
        }
        return devices;
      })();

      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch {
      return [];
    }
  },

  /**
   * Register or claim a new physical wearable device.
   * Links ownership between /devices/{deviceId} and /userDevices/{uid}/{deviceId}.
   */
  async pairDevice(uid: string, deviceId: string, deviceName: string): Promise<boolean> {
    if (!isFirebaseConfigured() || !database) {
      throw new Error("Backend connection is not configured.");
    }

    const cleanDeviceId = deviceId.trim().toUpperCase();
    if (!cleanDeviceId) {
      throw new Error("Device Hardware ID is required.");
    }

    // Check device ownership in system catalog
    const deviceRef = ref(database, `devices/${cleanDeviceId}`);
    const deviceSnap = await get(deviceRef);

    if (deviceSnap.exists()) {
      const existing = deviceSnap.val();
      if (existing.ownerUid && existing.ownerUid !== uid) {
        throw new Error("This hardware device is already registered to another patient account.");
      }
      // Update ownership if unowned
      await update(deviceRef, {
        ownerUid: uid,
        status: "PAIRED",
        lastUpdated: Date.now(),
      });
    } else {
      // Create initial device record in catalog
      await set(deviceRef, {
        ownerUid: uid,
        model: "Samadhan Health Wearable (ESP32-S3)",
        firmwareVersion: "v1.0.0-esp32s3",
        status: "PAIRED",
        lastSeen: 0,
        sensors: {
          max30102: "INITIALIZED",
          mpu6050: "INITIALIZED",
          dht22: "INITIALIZED",
        },
      });
    }

    // Link device in /userDevices/{uid}/{cleanDeviceId}
    await set(ref(database, `userDevices/${uid}/${cleanDeviceId}`), {
      pairedAt: Date.now(),
      customName: deviceName || cleanDeviceId,
    });

    return true;
  },

  /**
   * Disconnect / unpair a wearable device from the user account.
   */
  async disconnectDevice(uid: string, deviceId: string): Promise<void> {
    if (!isFirebaseConfigured() || !database) return;
    const cleanDeviceId = deviceId.trim().toUpperCase();
    await remove(ref(database, `userDevices/${uid}/${cleanDeviceId}`));
    
    // Mark status in device catalog
    const deviceRef = ref(database, `devices/${cleanDeviceId}`);
    const snap = await get(deviceRef);
    if (snap.exists() && snap.val().ownerUid === uid) {
      await update(deviceRef, {
        status: "UNPAIRED",
        lastUpdated: Date.now(),
      });
    }
  },
};
