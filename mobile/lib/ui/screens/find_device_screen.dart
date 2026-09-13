import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/modules/guardian/wearable_guardian_service.dart';
import 'package:samadhan_health/ui/screens/device_pairing_screen.dart';

class FindDeviceScreen extends StatefulWidget {
  const FindDeviceScreen({super.key});

  @override
  State<FindDeviceScreen> createState() => _FindDeviceScreenState();
}

class _FindDeviceScreenState extends State<FindDeviceScreen> with SingleTickerProviderStateMixin {
  late AnimationController _radarController;
  bool _isRinging = false;

  @override
  void initState() {
    super.initState();
    _radarController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _radarController.dispose();
    super.dispose();
  }

  void _triggerBuzzer() async {
    final ble = context.read<BleGatewayService>();
    setState(() {
      _isRinging = true;
    });

    final success = await ble.triggerFindDeviceBuzzer();

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(
                success ? Icons.volume_up_rounded : Icons.info_outline_rounded,
                color: Colors.white,
              ),
              const SizedBox(width: 10),
              Text(
                success
                    ? 'Band buzzer command transmitted to ESP32-S3!'
                    : 'Device not reachable to ring buzzer.',
              ),
            ],
          ),
          backgroundColor: success ? AppTheme.primaryTeal : Colors.redAccent,
          duration: const Duration(seconds: 2),
        ),
      );
    }

    await Future.delayed(const Duration(milliseconds: 1500));
    if (mounted) {
      setState(() {
        _isRinging = false;
      });
    }
  }

  String _getProximityLabel(double distance) {
    if (distance < 1.0) return 'Immediate Proximity (<1m)';
    if (distance < 3.0) return 'Near Room Distance (~1-3m)';
    if (distance < 7.0) return 'Medium Range (~3-7m)';
    return 'Far / Marginal Range (>7m)';
  }

  Color _getProximityColor(double distance) {
    if (distance < 1.5) return AppTheme.primaryTeal;
    if (distance < 4.0) return AppTheme.accentBlue;
    if (distance < 8.0) return Colors.amber;
    return Colors.deepOrangeAccent;
  }

  @override
  Widget build(BuildContext context) {
    final ble = context.watch<BleGatewayService>();
    final guardian = context.watch<WearableGuardianService>();
    final distance = guardian.estimatedDistance;
    final color = ble.isConnected ? _getProximityColor(distance) : Colors.grey;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'RADAR PROXIMITY FINDER',
          style: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 16),

            // Radar Device Label
            Text(
              ble.connectedDevice?.platformName.isNotEmpty == true
                  ? ble.connectedDevice!.platformName
                  : (ble.isConnected ? 'Samadhan Wearable Band' : 'No Hardware Connected'),
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              ble.isConnected
                  ? 'Real-time BLE signal attenuation & distance estimation'
                  : 'Connect wearable to view active radar tracking',
              style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
            ),

            const Spacer(),

            // Animated Radar Rings
            Center(
              child: SizedBox(
                width: 280,
                height: 280,
                child: AnimatedBuilder(
                  animation: _radarController,
                  builder: (context, child) {
                    final val = _radarController.value;
                    final ripple1 = val;
                    final ripple2 = (val + 0.33) % 1.0;
                    final ripple3 = (val + 0.66) % 1.0;

                    return Stack(
                      alignment: Alignment.center,
                      children: [
                        // Static Soft Grid Rings
                        Container(
                          width: 260,
                          height: 260,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.border, width: 1),
                          ),
                        ),
                        Container(
                          width: 180,
                          height: 180,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.border, width: 1),
                          ),
                        ),
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.border, width: 1),
                          ),
                        ),

                        // Animated Ripple Rings
                        Container(
                          width: 280 * ripple1,
                          height: 280 * ripple1,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: color.withValues(alpha: (1.0 - ripple1) * 0.35),
                              width: 2,
                            ),
                          ),
                        ),
                        Container(
                          width: 280 * ripple2,
                          height: 280 * ripple2,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: color.withValues(alpha: (1.0 - ripple2) * 0.35),
                              width: 2,
                            ),
                          ),
                        ),
                        Container(
                          width: 280 * ripple3,
                          height: 280 * ripple3,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: color.withValues(alpha: (1.0 - ripple3) * 0.35),
                              width: 2,
                            ),
                          ),
                        ),

                        // Center Pulsing Device Icon
                        Container(
                          width: 76,
                          height: 76,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: color.withValues(alpha: 0.12),
                            border: Border.all(color: color, width: 2),
                            boxShadow: [
                              BoxShadow(
                                color: color.withValues(alpha: 0.2),
                                blurRadius: 16,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: Icon(
                            Icons.watch_rounded,
                            color: color,
                            size: 36,
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),

            const Spacer(),

            // Distance & Proximity Readout
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 24.0),
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 18.0),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.border),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        ble.isConnected ? distance.toStringAsFixed(1) : '--',
                        style: GoogleFonts.jetBrainsMono(
                          fontSize: 42,
                          fontWeight: FontWeight.bold,
                          color: color,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'METERS',
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    ble.isConnected ? _getProximityLabel(distance) : 'Wearable disconnected',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.signal_cellular_alt_rounded, size: 14, color: color),
                      const SizedBox(width: 6),
                      Text(
                        'BLE RSSI: ${ble.currentRssi} dBm',
                        style: GoogleFonts.jetBrainsMono(
                          fontSize: 11,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Action Button
            if (ble.isConnected) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: ElevatedButton.icon(
                  onPressed: _isRinging ? null : _triggerBuzzer,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryTeal,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.volume_up_rounded, size: 20),
                  label: Text(
                    _isRinging ? 'RINGING BAND BUZZER...' : 'RING WEARABLE BUZZER',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.8,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
            ] else ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const DevicePairingScreen()),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.primaryTeal,
                    backgroundColor: AppTheme.surface,
                    side: const BorderSide(color: AppTheme.primaryTeal),
                    minimumSize: const Size.fromHeight(50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.bluetooth_searching_rounded, size: 20),
                  label: Text(
                    'CONNECT WEARABLE BAND',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.8,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
            ],

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
