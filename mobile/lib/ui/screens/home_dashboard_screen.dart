import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/auth/auth_service.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/modules/guardian/wearable_guardian_service.dart';
import 'package:samadhan_health/modules/risk/tiny_ml_risk_engine.dart';
import 'package:samadhan_health/modules/sync/firebase_sync_service.dart';
import 'package:samadhan_health/ui/screens/ai_companion_screen.dart';
import 'package:samadhan_health/ui/screens/device_pairing_screen.dart';
import 'package:samadhan_health/ui/screens/emergency_sos_screen.dart';
import 'package:samadhan_health/ui/screens/find_device_screen.dart';
import 'package:samadhan_health/ui/screens/live_vitals_screen.dart';
import 'package:samadhan_health/ui/widgets/vital_card.dart';

class HomeDashboardScreen extends StatefulWidget {
  const HomeDashboardScreen({Key? key}) : super(key: key);

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  void _showSnoozeModal(BuildContext context, GuardianAlertType type, String title) {
    final guardian = context.read<WearableGuardianService>();

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF131B2E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    const Icon(Icons.snooze_rounded, color: AppTheme.primaryTeal, size: 24),
                    const SizedBox(width: 12),
                    Text(
                      'Snooze $title',
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'Temporarily silence this guardian alert. You will be reminded again once the snooze expires.',
                  style: GoogleFonts.inter(fontSize: 13, color: Colors.white60),
                ),
                const SizedBox(height: 20),
                ListTile(
                  leading: const Icon(Icons.timer_outlined, color: Colors.white70),
                  title: const Text('Snooze for 10 Minutes', style: TextStyle(color: Colors.white)),
                  onTap: () {
                    guardian.snoozeAlert(type, const Duration(minutes: 10));
                    Navigator.pop(ctx);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.timer_outlined, color: Colors.white70),
                  title: const Text('Snooze for 30 Minutes', style: TextStyle(color: Colors.white)),
                  onTap: () {
                    guardian.snoozeAlert(type, const Duration(minutes: 30));
                    Navigator.pop(ctx);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.timer_outlined, color: Colors.white70),
                  title: const Text('Snooze for 1 Hour', style: TextStyle(color: Colors.white)),
                  onTap: () {
                    guardian.snoozeAlert(type, const Duration(hours: 1));
                    Navigator.pop(ctx);
                  },
                ),
                const SizedBox(height: 10),
                TextButton(
                  onPressed: () {
                    guardian.dismissAlert(type);
                    Navigator.pop(ctx);
                  },
                  child: const Text('Dismiss for now', style: TextStyle(color: Colors.white54)),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showSimulationControls(BuildContext context) {
    final ble = context.read<BleGatewayService>();

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF131B2E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Hardware Simulation Controls',
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Trigger edge hardware events to test guardian alerts and TinyML risk states.',
                  style: TextStyle(fontSize: 12, color: Colors.white54),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          ble.simulateTakeOffWrist();
                          Navigator.pop(ctx);
                        },
                        icon: const Icon(Icons.pan_tool_outlined, size: 16),
                        label: const Text('Take Off Wrist'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.amber[800]),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          ble.simulatePutOnWrist();
                          Navigator.pop(ctx);
                        },
                        icon: const Icon(Icons.check_circle_outline, size: 16),
                        label: const Text('Put On Wrist'),
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryTeal, foregroundColor: Colors.black),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          ble.simulateMoveAway();
                          Navigator.pop(ctx);
                        },
                        icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                        label: const Text('Move Far (>8m)'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.deepOrange),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          ble.simulateMoveClose();
                          Navigator.pop(ctx);
                        },
                        icon: const Icon(Icons.near_me_rounded, size: 16),
                        label: const Text('Move Close (<1m)'),
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentBlue),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          ble.simulateToggleCharging();
                          Navigator.pop(ctx);
                        },
                        icon: const Icon(Icons.bolt_rounded, size: 16),
                        label: const Text('Toggle Charging'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.purple[700]),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          ble.simulateEmergencyFall();
                          Navigator.pop(ctx);
                        },
                        icon: const Icon(Icons.warning_amber_rounded, size: 16),
                        label: const Text('Simulate Fall'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700]),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final ble = context.watch<BleGatewayService>();
    final sync = context.watch<FirebaseSyncService>();
    final guardian = context.watch<WearableGuardianService>();
    final packet = ble.latestPacket;
    final assessment = ble.latestRiskAssessment;

    final user = auth.currentUser;

    Color riskColor;
    switch (assessment?.state) {
      case FusionRiskState.emergency:
      case FusionRiskState.critical:
        riskColor = AppTheme.danger;
        break;
      case FusionRiskState.warning:
        riskColor = AppTheme.warning;
        break;
      case FusionRiskState.watch:
        riskColor = Colors.amber;
        break;
      case FusionRiskState.normal:
      default:
        riskColor = AppTheme.primaryTeal;
        break;
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              user?.displayName != null ? 'PATIENT: ${user!.displayName}' : 'SAMADHAN HEALTH',
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
                color: Colors.white,
              ),
            ),
            Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: sync.cloudStatus == CloudSyncStatus.online ? AppTheme.primaryTeal : Colors.amber,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  sync.cloudStatus == CloudSyncStatus.online
                      ? 'Cloud Synced (Firebase RTDB)'
                      : 'Offline Buffer (${sync.unsyncedCount} queued)',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    color: Colors.white54,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Find Device Radar Icon
          IconButton(
            icon: const Icon(Icons.radar_rounded, color: AppTheme.primaryTeal),
            tooltip: 'Find My Wearable',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const FindDeviceScreen()),
              );
            },
          ),
          // Hardware Simulation Controls
          IconButton(
            icon: const Icon(Icons.science_outlined, color: Colors.white70),
            tooltip: 'Test Hardware Events',
            onPressed: () => _showSimulationControls(context),
          ),
          // Pairing screen
          IconButton(
            icon: const Icon(Icons.bluetooth_searching_rounded, color: Colors.white70),
            tooltip: 'Pair Device',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const DevicePairingScreen()),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            if (user != null) {
              await sync.flushOfflineBuffer(user.uid);
            }
          },
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            children: [
              // 1. Wearable Top Status Header Bar (Charging, Proximity, Wrist)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF131B2E),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Battery & Charging State
                    Row(
                      children: [
                        Icon(
                          guardian.isCharging ? Icons.bolt_rounded : Icons.battery_charging_full_rounded,
                          color: guardian.isCharging ? AppTheme.primaryTeal : (guardian.batteryLevel < 20 ? Colors.redAccent : Colors.white70),
                          size: 18,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          guardian.isCharging ? '⚡ ${guardian.batteryLevel}% Charging' : '${guardian.batteryLevel}%',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),

                    // Proximity Distance to Band
                    InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const FindDeviceScreen()),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.radar_rounded, size: 14, color: AppTheme.primaryTeal),
                            const SizedBox(width: 6),
                            Text(
                              '~${guardian.estimatedDistance.toStringAsFixed(1)}m away',
                              style: GoogleFonts.jetBrainsMono(
                                fontSize: 11,
                                color: AppTheme.primaryTeal,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Wrist Contact State
                    Row(
                      children: [
                        Icon(
                          guardian.isWristWorn ? Icons.how_to_reg_rounded : Icons.person_off_rounded,
                          size: 16,
                          color: guardian.isWristWorn ? AppTheme.primaryTeal : Colors.amber,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          guardian.isWristWorn ? 'On Wrist' : 'Off Wrist',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: guardian.isWristWorn ? Colors.white70 : Colors.amber,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // 2. GUARDIAN ALERT BANNERS (With Snooze)
              // (a) Out of Range Alert
              if (guardian.isOutOfRangeAlertVisible) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.deepOrange.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.deepOrange.withOpacity(0.5)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.warning_rounded, color: Colors.deepOrange, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'WEARABLE OUT OF RANGE',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.deepOrangeAccent,
                                letterSpacing: 1.0,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.snooze_rounded, color: Colors.white70, size: 20),
                            onPressed: () => _showSnoozeModal(context, GuardianAlertType.outOfRange, 'Out-of-Range Alert'),
                          ),
                        ],
                      ),
                      Text(
                        'You appear to have walked far from your Samadhan Band (~${guardian.estimatedDistance.toStringAsFixed(1)}m away).',
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const FindDeviceScreen()),
                              );
                            },
                            icon: const Icon(Icons.radar_rounded, size: 16),
                            label: const Text('FIND BAND RADAR'),
                            style: TextButton.styleFrom(foregroundColor: Colors.white),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],

              // (b) Off-Wrist Detached Alert
              if (guardian.isOffWristAlertVisible) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.amber.withOpacity(0.16),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.amber.withOpacity(0.4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.pan_tool_outlined, color: Colors.amber, size: 24),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'WEARABLE NOT ON WRIST',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.amber,
                                letterSpacing: 1.0,
                              ),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Optical PPG sensor is disconnected from skin. Please put on the band.',
                              style: TextStyle(color: Colors.white70, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.snooze_rounded, color: Colors.white70),
                        onPressed: () => _showSnoozeModal(context, GuardianAlertType.offWrist, 'Off-Wrist Alert'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],

              // (c) Low Battery Alert
              if (guardian.isLowBatteryAlertVisible) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.16),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.red.withOpacity(0.4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.battery_alert_rounded, color: Colors.redAccent, size: 24),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'LOW BATTERY (${guardian.batteryLevel}%)',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.redAccent,
                              ),
                            ),
                            const Text(
                              'Connect the magnetic charging dock to maintain monitoring.',
                              style: TextStyle(color: Colors.white70, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.snooze_rounded, color: Colors.white70),
                        onPressed: () => _showSnoozeModal(context, GuardianAlertType.lowBattery, 'Low Battery Alert'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],

              // (d) Active Charging Notification
              if (guardian.chargingStatusMessage != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryTeal.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.primaryTeal.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.bolt_rounded, color: AppTheme.primaryTeal, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        guardian.chargingStatusMessage!,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primaryTeal,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],

              // 3. Fall Emergency Alert Banner (Contract Section 4)
              if (packet?.fallDetected == true) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.danger.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.danger, width: 2),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: AppTheme.danger, size: 36),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'FALL CONFIRMED (MPU6050)',
                              style: TextStyle(
                                color: AppTheme.danger,
                                fontWeight: FontWeight.w900,
                                fontSize: 15,
                              ),
                            ),
                            Text(
                              'Acceleration magnitude: ${packet?.accelMagnitude?.toStringAsFixed(2) ?? "--"}g. SOS protocol active.',
                              style: const TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // 4. Real-time Physiological Vitals Grid
              Row(
                children: [
                  Expanded(
                    child: VitalCard(
                      label: 'HEART RATE',
                      value: packet?.heartRate != null ? '${packet!.heartRate}' : '--',
                      unit: 'BPM',
                      icon: Icons.favorite_rounded,
                      accentColor: AppTheme.danger,
                      subtitle: packet?.hrStatus ?? 'NO SIGNAL',
                      isWarning: packet?.heartRate != null && (packet!.heartRate! > 120 || packet.heartRate! < 50),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: VitalCard(
                      label: 'BLOOD OXYGEN',
                      value: packet?.spo2 != null ? '${packet!.spo2!.toStringAsFixed(1)}' : '--',
                      unit: '% SpO2',
                      icon: Icons.water_drop_rounded,
                      accentColor: AppTheme.secondary,
                      subtitle: packet?.spo2Status ?? 'NO SIGNAL',
                      isWarning: packet?.spo2 != null && packet!.spo2! < 92.0,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: VitalCard(
                      label: 'TEMPERATURE',
                      value: packet?.temperature != null ? '${packet!.temperature!.toStringAsFixed(1)}' : '--',
                      unit: '°C',
                      icon: Icons.thermostat_rounded,
                      accentColor: AppTheme.warning,
                      subtitle: 'DHT22 AMBIENT',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: VitalCard(
                      label: 'MOTION & POSTURE',
                      value: packet?.movementState ?? 'IDLE',
                      unit: '${packet?.accelMagnitude?.toStringAsFixed(2) ?? "1.00"}g',
                      icon: Icons.directions_walk_rounded,
                      accentColor: AppTheme.primaryTeal,
                      subtitle: 'MPU6050 6-AXIS',
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 18),

              // 5. On-Device TinyML Multi-Sensor Temporal Risk Assessment Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xFF131B2E),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: riskColor.withOpacity(0.35), width: 1.5),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: riskColor.withOpacity(0.18),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            assessment?.state == FusionRiskState.emergency ||
                                    assessment?.state == FusionRiskState.critical
                                ? Icons.warning_amber_rounded
                                : Icons.psychology_rounded,
                            color: riskColor,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'ON-DEVICE TINYML: ${assessment?.state.name.toUpperCase() ?? "NORMAL"}',
                                style: TextStyle(
                                  color: riskColor,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.8,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Primary Factor: ${assessment?.primaryContributingFactor ?? "Stable Baseline"}',
                                style: const TextStyle(
                                  color: AppTheme.textSecondary,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: riskColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: riskColor.withOpacity(0.3)),
                          ),
                          child: Text(
                            '${assessment?.compositeRiskScore ?? 12.0}/100',
                            style: TextStyle(
                              color: riskColor,
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // TinyML Sub-indices Breakdown
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _TinyMlPill(label: 'Cardiac', value: '${assessment?.cardiacStressIndex ?? 10.0}', color: AppTheme.danger),
                        _TinyMlPill(label: 'Hypoxia', value: '${assessment?.respiratoryIndex ?? 5.0}', color: AppTheme.secondary),
                        _TinyMlPill(label: 'Heat', value: '${assessment?.heatStressIndex ?? 10.0}', color: AppTheme.warning),
                        _TinyMlPill(label: 'Fall', value: '${assessment?.fallRiskIndex ?? 0.0}', color: AppTheme.primaryTeal),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 6. Navigation Action Buttons (Telemetry Charts, AI Companion, Find My Band)
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
                      label: const Text('CHARTS'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.primaryTeal,
                        side: const BorderSide(color: Colors.white24),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const FindDeviceScreen()),
                        );
                      },
                      icon: const Icon(Icons.radar_rounded, size: 18),
                      label: const Text('FIND BAND'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.accentBlue,
                        side: const BorderSide(color: Colors.white24),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AiCompanionScreen()),
                        );
                      },
                      icon: const Icon(Icons.auto_awesome, size: 16, color: Colors.black),
                      label: const Text('AI DOCTOR', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryTeal,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // 7. Emergency SOS Trigger Button
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const EmergencySosScreen()),
                  );
                },
                icon: const Icon(Icons.sos_rounded, color: Colors.white, size: 22),
                label: const Text('EMERGENCY SOS WORKFLOW', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.danger,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _TinyMlPill extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _TinyMlPill({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF0E1424),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
