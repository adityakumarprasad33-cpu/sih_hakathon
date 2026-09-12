import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/constants/app_constants.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/auth/auth_service.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/modules/sync/firebase_sync_service.dart';
import 'package:samadhan_health/ui/screens/ai_companion_screen.dart';
import 'package:samadhan_health/ui/screens/device_pairing_screen.dart';
import 'package:samadhan_health/ui/screens/emergency_sos_screen.dart';
import 'package:samadhan_health/ui/screens/live_vitals_screen.dart';
import 'package:samadhan_health/ui/widgets/pulse_wave_painter.dart';
import 'package:samadhan_health/ui/widgets/vital_card.dart';

class HomeDashboardScreen extends StatelessWidget {
  const HomeDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final ble = context.watch<BleGatewayService>();
    final sync = context.watch<FirebaseSyncService>();

    final packet = ble.latestPacket;
    final hr = packet?.heartRate ?? 72;
    
    
    final isLive = ble.status == ConnectionStatus.live;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              auth.currentUser?.displayName ?? 'PATIENT GATEWAY',
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              packet?.deviceId ?? 'SAMADHAN-BAND-A7F39C',
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.textMuted,
                letterSpacing: 0.3,
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ConnectionBadge(status: ble.status),
          ),
          IconButton(
            icon: const Icon(Icons.bluetooth_searching, color: AppTheme.primary, size: 22),
            tooltip: 'Device Hub',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const DevicePairingScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: AppTheme.textSecondary, size: 20),
            onPressed: () => auth.signOut(),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Continuous Pulse Wave Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.border),
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.surface,
                      AppTheme.surfaceLight.withOpacity(0.5),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.monitor_heart_rounded, color: AppTheme.primary, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'CONTINUOUS PULSE WAVE (PPG)',
                              style: TextStyle(
                                color: AppTheme.textSecondary,
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppTheme.primary.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            ' BPM',
                            style: const TextStyle(
                              color: AppTheme.primary,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    LivePulseWaveWidget(
                      heartRate: hr,
                      isLive: isLive,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'PPG Quality: ',
                          style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                        ),
                        Text(
                          'Battery: % â€¢ ESP32-S3',
                          style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // 2. Offline Sync & Buffer Status Banner (Contract Section 5)
              if (sync.unsyncedCount > 0 || !isLive) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppTheme.warning.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.warning.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.cloud_queue_rounded, color: AppTheme.warning, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          sync.unsyncedCount > 0
                              ? ' packets buffered in offline ring buffer'
                              : 'Cloud gateway active â€¢ /telemetry/live',
                          style: const TextStyle(
                            color: AppTheme.textPrimary,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      if (sync.unsyncedCount > 0)
                        TextButton(
                          onPressed: sync.isSyncing
                              ? null
                              : () => sync.flushOfflineBuffer(auth.currentUser?.uid ?? 'demo-patient'),
                          child: sync.isSyncing
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Text('SYNC NOW', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
              ],

              // 3. Grid of Sensor Vitals (Contract Section 4)
              Row(
                children: [
                  Expanded(
                    child: VitalCard(
                      label: 'Heart Rate',
                      value: '',
                      unit: 'BPM',
                      icon: Icons.favorite_rounded,
                      accentColor: AppTheme.danger,
                      subtitle: 'MAX30102 â€¢ ',
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: VitalCard(
                      label: 'SpO2 Oxygen',
                      value: '',
                      unit: '%',
                      icon: Icons.water_drop_rounded,
                      accentColor: AppTheme.secondary,
                      subtitle: 'MAX30102 â€¢ ',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: VitalCard(
                      label: 'Ambient Temp',
                      value: '',
                      unit: 'Â°C',
                      icon: Icons.thermostat_rounded,
                      accentColor: AppTheme.warning,
                      subtitle: 'DHT22 â€¢ Hum: %',
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: VitalCard(
                      label: 'IMU Motion',
                      value: '',
                      unit: 'g',
                      icon: Icons.directions_walk_rounded,
                      accentColor: AppTheme.success,
                      subtitle: 'MPU6050 â€¢ ',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // 4. Clinical Risk & Fall Detection Subsystem
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: packet?.riskLevel == RiskLevel.critical
                        ? AppTheme.danger
                        : AppTheme.border,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: (packet?.riskLevel == RiskLevel.critical
                                ? AppTheme.danger
                                : AppTheme.success)
                            .withOpacity(0.15),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        packet?.riskLevel == RiskLevel.critical
                            ? Icons.warning_amber_rounded
                            : Icons.shield_rounded,
                        color: packet?.riskLevel == RiskLevel.critical
                            ? AppTheme.danger
                            : AppTheme.success,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'FALL STATE: ',
                            style: TextStyle(
                              color: packet?.riskLevel == RiskLevel.critical
                                  ? AppTheme.danger
                                  : AppTheme.success,
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            packet?.fallDetected == true
                                ? 'HIGH IMPACT FALL CONFIRMED â€¢ SOS ALERT ENGAGED'
                                : 'Overall Quality:  â€¢ Risk: /100',
                            style: const TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 5. Navigation Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const LiveVitalsScreen()),
                        );
                      },
                      icon: const Icon(Icons.insights_rounded, size: 18),
                      label: const Text('TELEMETRY CHARTS'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.primary,
                        side: const BorderSide(color: AppTheme.border),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AiCompanionScreen()),
                        );
                      },
                      icon: const Icon(Icons.auto_awesome, size: 18, color: Colors.black),
                      label: const Text('AI COMPANION'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // 6. Emergency SOS Trigger Button
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const EmergencySosScreen()),
                  );
                },
                icon: const Icon(Icons.sos_rounded, color: Colors.white, size: 22),
                label: const Text('EMERGENCY SOS WORKFLOW', style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.danger,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}