import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';

class DevicePairingScreen extends StatelessWidget {
  const DevicePairingScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final ble = context.watch<BleGatewayService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('WEARABLE DEVICE HUB'),
        actions: [
          IconButton(
            icon: Icon(
              ble.isScanning ? Icons.stop_circle_outlined : Icons.refresh_rounded,
              color: AppTheme.primary,
            ),
            onPressed: ble.isScanning ? ble.stopScan : ble.startScan,
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            // Simulation Mode Control
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.primary.withOpacity(0.4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.developer_mode_rounded, color: AppTheme.primary, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'HARDWARE SIMULATOR',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      Switch(
                        value: ble.isSimulationActive,
                        activeColor: AppTheme.primary,
                        onChanged: (val) {
                          if (val) {
                            ble.startSimulation();
                          } else {
                            ble.stopSimulation();
                          }
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Simulates realistic ESP32-S3 MAX30102 PPG & MPU6050 packets when physical band is absent.',
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                  ),
                  if (ble.isSimulationActive) ...[
                    const SizedBox(height: 14),
                    OutlinedButton.icon(
                      onPressed: () {
                        ble.simulateEmergencyFall();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Simulated High-Impact Fall Triggered! Check Dashboard/Alerts.'),
                            backgroundColor: AppTheme.danger,
                          ),
                        );
                      },
                      icon: const Icon(Icons.warning_amber_rounded, size: 18),
                      label: const Text('SIMULATE HIGH-IMPACT FALL'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.danger,
                        side: const BorderSide(color: AppTheme.danger),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Discovered BLE Devices Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'DISCOVERED BLUETOOTH DEVICES',
                  style: TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                  ),
                ),
                if (ble.isScanning)
                  const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary),
                  ),
              ],
            ),
            const SizedBox(height: 12),

            if (ble.scanResults.isEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.bluetooth_searching, size: 40, color: AppTheme.textMuted),
                    const SizedBox(height: 12),
                    Text(
                      ble.isScanning
                          ? 'Scanning for SAMADHAN-BAND peripherals...'
                          : 'No devices found yet. Tap refresh to scan nearby Bluetooth devices.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ] else ...[
              ...ble.scanResults.map((result) {
                final name = result.device.platformName.isNotEmpty
                    ? result.device.platformName
                    : 'Unknown Device';
                final isPaired = ble.connectedDevice?.remoteId == result.device.remoteId;

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: isPaired ? AppTheme.primary : AppTheme.border),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.watch_rounded,
                        color: isPaired ? AppTheme.primary : AppTheme.textSecondary,
                        size: 24,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name,
                              style: const TextStyle(
                                color: AppTheme.textPrimary,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'RSSI:  dBm • ID: ',
                              style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          if (isPaired) {
                            ble.disconnectDevice();
                          } else {
                            ble.connectToDevice(result.device);
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isPaired ? AppTheme.danger : AppTheme.primary,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          minimumSize: const Size(60, 32),
                        ),
                        child: Text(
                          isPaired ? 'DISCONNECT' : 'PAIR',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }
}