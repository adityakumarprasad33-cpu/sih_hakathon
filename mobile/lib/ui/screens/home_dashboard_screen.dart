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
import 'package:samadhan_health/ui/screens/auth_screen.dart';
import 'package:samadhan_health/ui/screens/device_pairing_screen.dart';
import 'package:samadhan_health/ui/screens/emergency_sos_screen.dart';
import 'package:samadhan_health/ui/screens/find_device_screen.dart';
import 'package:samadhan_health/ui/screens/live_vitals_screen.dart';
import 'package:samadhan_health/ui/widgets/vital_card.dart';

class HomeDashboardScreen extends StatefulWidget {
  const HomeDashboardScreen({super.key});

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  void _showSnoozeModal(BuildContext context, GuardianAlertType type, String title) {
    final guardian = context.read<WearableGuardianService>();

    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surface,
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
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'Temporarily silence this guardian alert. You will be reminded again once the snooze expires.',
                  style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 20),
                ListTile(
                  leading: const Icon(Icons.timer_outlined, color: AppTheme.primaryTeal),
                  title: const Text('Snooze for 10 Minutes', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w500)),
                  onTap: () {
                    guardian.snoozeAlert(type, const Duration(minutes: 10));
                    Navigator.pop(ctx);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.timer_outlined, color: AppTheme.primaryTeal),
                  title: const Text('Snooze for 30 Minutes', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w500)),
                  onTap: () {
                    guardian.snoozeAlert(type, const Duration(minutes: 30));
                    Navigator.pop(ctx);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.timer_outlined, color: AppTheme.primaryTeal),
                  title: const Text('Snooze for 1 Hour', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w500)),
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
                  child: const Text('Dismiss for now', style: TextStyle(color: AppTheme.textSecondary)),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showProfileModal(BuildContext context) {
    final auth = context.read<AuthService>();
    final ble = context.read<BleGatewayService>();
    final user = auth.currentUser;

    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surface,
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
                Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppTheme.primaryTeal.withValues(alpha: 0.2),
                      child: Text(
                        (user?.displayName.isNotEmpty == true ? user!.displayName[0] : 'P').toUpperCase(),
                        style: GoogleFonts.outfit(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryTeal,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.displayName ?? 'Samadhan Patient',
                            style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          Text(
                            user?.email ?? '',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryTeal.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'PATIENT',
                        style: GoogleFonts.jetBrainsMono(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryTeal,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const Divider(color: AppTheme.border),
                const SizedBox(height: 12),

                // Emergency Contacts
                Row(
                  children: [
                    const Icon(Icons.emergency_outlined, size: 18, color: Colors.redAccent),
                    const SizedBox(width: 10),
                    Text(
                      'Emergency Contact:',
                      style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 13),
                    ),
                    const Spacer(),
                    Text(
                      user?.emergencyContacts.isNotEmpty == true ? user!.emergencyContacts.first : 'None',
                      style: GoogleFonts.jetBrainsMono(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Paired Hardware
                Row(
                  children: [
                    const Icon(Icons.watch_rounded, size: 18, color: AppTheme.primaryTeal),
                    const SizedBox(width: 10),
                    Text(
                      'Paired Band:',
                      style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 13),
                    ),
                    const Spacer(),
                    Text(
                      ble.connectedDevice?.platformName.isNotEmpty == true
                          ? ble.connectedDevice!.platformName
                          : (ble.lastPairedDeviceId != null && ble.lastPairedDeviceId!.length >= 8
                              ? 'ID: ${ble.lastPairedDeviceId!.substring(0, 8)}...'
                              : 'None'),
                      style: GoogleFonts.jetBrainsMono(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Logout Action
                OutlinedButton.icon(
                  onPressed: () async {
                    Navigator.pop(ctx);
                    ble.disconnectDevice();
                    await auth.signOut();
                    if (context.mounted) {
                      Navigator.of(context).pushAndRemoveUntil(
                        PageRouteBuilder(
                          transitionDuration: const Duration(milliseconds: 500),
                          pageBuilder: (context, anim1, anim2) => const AuthScreen(),
                          transitionsBuilder: (context, anim1, anim2, child) => FadeTransition(opacity: anim1, child: child),
                        ),
                        (route) => false,
                      );
                    }
                  },
                  icon: const Icon(Icons.logout_rounded, size: 18, color: Colors.redAccent),
                  label: Text(
                    'SIGN OUT OF GATEWAY',
                    style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.8),
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.redAccent,
                    side: const BorderSide(color: Colors.redAccent),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
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
      backgroundColor: AppTheme.background,
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
                color: AppTheme.textPrimary,
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
                    color: AppTheme.textSecondary,
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

          // Pairing screen
          IconButton(
            icon: const Icon(Icons.bluetooth_searching_rounded, color: AppTheme.textSecondary),
            tooltip: 'Pair Device',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const DevicePairingScreen()),
              );
            },
          ),

          // Profile & Settings
          IconButton(
            icon: CircleAvatar(
              radius: 14,
              backgroundColor: AppTheme.primaryTeal.withValues(alpha: 0.15),
              child: Text(
                (user?.displayName.isNotEmpty == true ? user!.displayName[0] : 'P').toUpperCase(),
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryTeal,
                ),
              ),
            ),
            tooltip: 'Patient Profile',
            onPressed: () => _showProfileModal(context),
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
              if (!ble.isConnected) ...[
                InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const DevicePairingScreen()),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppTheme.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.border),
                      boxShadow: AppTheme.cardShadow,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.orange,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'NO WEARABLE CONNECTED',
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.8,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 2),
                              const Text(
                                'Tap to scan and pair your Samadhan Band via Bluetooth Low Energy.',
                                style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppTheme.primaryTeal),
                      ],
                    ),
                  ),
                ),
              ] else ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.border),
                    boxShadow: AppTheme.cardShadow,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Battery & Charging State
                      Row(
                        children: [
                          Icon(
                            guardian.isCharging ? Icons.bolt_rounded : Icons.battery_charging_full_rounded,
                            color: guardian.isCharging ? AppTheme.primaryTeal : (guardian.batteryLevel < 20 ? Colors.redAccent : AppTheme.textSecondary),
                            size: 18,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            guardian.isCharging ? '⚡ ${guardian.batteryLevel}% Charging' : '${guardian.batteryLevel}%',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.textPrimary,
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
                            color: AppTheme.surfaceSubtle,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.border),
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
                            color: guardian.isWristWorn ? AppTheme.primaryTeal : Colors.amber.shade700,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            guardian.isWristWorn ? 'On Wrist' : 'Off Wrist',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: guardian.isWristWorn ? AppTheme.textPrimary : Colors.amber.shade700,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 12),

              // 2. GUARDIAN ALERT BANNERS (With Snooze)
              // (a) Out of Range Alert
              if (guardian.isOutOfRangeAlertVisible) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFFDBA74)),
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
                                color: const Color(0xFFC2410C),
                                letterSpacing: 1.0,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.snooze_rounded, color: Color(0xFFC2410C), size: 20),
                            onPressed: () => _showSnoozeModal(context, GuardianAlertType.outOfRange, 'Out-of-Range Alert'),
                          ),
                        ],
                      ),
                      Text(
                        'You appear to have walked far from your Samadhan Band (~${guardian.estimatedDistance.toStringAsFixed(1)}m away).',
                        style: const TextStyle(color: Color(0xFF9A3412), fontSize: 12),
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
                            style: TextButton.styleFrom(foregroundColor: const Color(0xFFC2410C)),
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
                    color: const Color(0xFFFFFBEB),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFFCD34D)),
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
                              style: TextStyle(color: Color(0xFF92400E), fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.snooze_rounded, color: Color(0xFFB45309)),
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
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFFCA5A5)),
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
                              style: TextStyle(color: Color(0xFF92400E), fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.snooze_rounded, color: Color(0xFFB45309)),
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
                    color: AppTheme.primaryTeal.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.primaryTeal.withValues(alpha: 0.3)),
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
                    color: AppTheme.danger.withValues(alpha: 0.2),
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
                              style: const TextStyle(color: Color(0xFF9A3412), fontSize: 12),
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
                      unit: '${packet?.accelMagnitude?.toStringAsFixed(2) ?? '1.00'}g',
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
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: riskColor.withValues(alpha: 0.35), width: 1.5),
                  boxShadow: AppTheme.cardShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: riskColor.withValues(alpha: 0.18),
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
                            color: riskColor.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: riskColor.withValues(alpha: 0.3)),
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
                        foregroundColor: AppTheme.textPrimary,
                        backgroundColor: AppTheme.surface,
                        side: const BorderSide(color: AppTheme.border),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
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
                        foregroundColor: AppTheme.primaryTeal,
                        backgroundColor: AppTheme.surface,
                        side: BorderSide(color: AppTheme.primaryTeal.withValues(alpha: 0.3)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
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
                      icon: const Icon(Icons.auto_awesome, size: 16, color: Colors.white),
                      label: const Text('AI DOCTOR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryTeal,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
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
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: AppTheme.surfaceSubtle,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
