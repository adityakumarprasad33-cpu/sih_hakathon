import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/modules/guardian/wearable_guardian_service.dart';
import 'package:samadhan_health/ui/screens/device_pairing_screen.dart';

class FindDeviceScreen extends StatefulWidget {
  const FindDeviceScreen({Key? key}) : super(key: key);

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

  Color _getDistanceColor(double distance) {
    if (distance < 1.5) return AppTheme.primaryTeal;
    if (distance < 5.0) return Colors.amber;
    if (distance < 8.0) return Colors.orange;
    return Colors.redAccent;
  }

  String _getProximityLabel(double distance) {
    if (distance < 1.5) return 'Very Close • Within Immediate Reach';
    if (distance < 5.0) return 'Nearby • In Same Room';
    if (distance < 8.0) return 'Far • Walking Away';
    return 'Weak Signal • Move Closer';
  }

  @override
  Widget build(BuildContext context) {
    final guardian = context.watch<WearableGuardianService>();
    final ble = context.watch<BleGatewayService>();
    final distance = guardian.estimatedDistance;
    final color = _getDistanceColor(distance);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'FIND MY WEARABLE',
          style: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            letterSpacing: 2.0,
            color: Colors.white,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            tooltip: 'Refresh Proximity',
            onPressed: () => guardian.checkPermissions(),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 16),

            // Connected Device Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF131B2E),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: ble.isConnected ? AppTheme.primaryTeal : Colors.orange,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    ble.connectedDevice?.platformName.isNotEmpty == true
                        ? ble.connectedDevice!.platformName
                        : (ble.isConnected ? 'SAMADHAN-BAND-ESP32' : 'NOT CONNECTED'),
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),

            const Spacer(),

            // Animated Sonar Radar Visualizer
            Center(
              child: SizedBox(
                width: 280,
                height: 280,
                child: AnimatedBuilder(
                  animation: _radarController,
                  builder: (context, child) {
                    final ripple1 = _radarController.value;
                    final ripple2 = (ripple1 + 0.33) % 1.0;
                    final ripple3 = (ripple1 + 0.66) % 1.0;

                    return Stack(
                      alignment: Alignment.center,
                      children: [
                        // Ripple Ring 1
                        Container(
                          width: 280 * ripple1,
                          height: 280 * ripple1,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: color.withOpacity((1.0 - ripple1) * 0.4),
                              width: 2,
                            ),
                          ),
                        ),
                        // Ripple Ring 2
                        Container(
                          width: 280 * ripple2,
                          height: 280 * ripple2,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: color.withOpacity((1.0 - ripple2) * 0.4),
                              width: 2,
                            ),
                          ),
                        ),
                        // Ripple Ring 3
                        Container(
                          width: 280 * ripple3,
                          height: 280 * ripple3,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: color.withOpacity((1.0 - ripple3) * 0.4),
                              width: 2,
                            ),
                          ),
                        ),
                        // Fixed Outer Grid Rings
                        Container(
                          width: 240,
                          height: 240,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white.withOpacity(0.06), width: 1),
                          ),
                        ),
                        Container(
                          width: 160,
                          height: 160,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white.withOpacity(0.08), width: 1),
                          ),
                        ),

                        // Center Pulsing Device Icon
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: color.withOpacity(0.18),
                            border: Border.all(color: color, width: 2),
                            boxShadow: [
                              BoxShadow(
                                color: color.withOpacity(0.35),
                                blurRadius: 20,
                                spreadRadius: 4,
                              ),
                            ],
                          ),
                          child: Icon(
                            Icons.watch_rounded,
                            color: color,
                            size: 38,
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
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
              decoration: BoxDecoration(
                color: const Color(0xFF131B2E),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: color.withOpacity(0.3)),
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
                          fontSize: 44,
                          fontWeight: FontWeight.bold,
                          color: color,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'METERS',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white54,
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
                      color: Colors.white70,
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
                          color: Colors.white38,
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
                    foregroundColor: Colors.black,
                    minimumSize: const Size.fromHeight(52),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 4,
                  ),
                  icon: const Icon(Icons.volume_up_rounded, size: 22),
                  label: Text(
                    _isRinging ? 'RINGING BAND BUZZER...' : 'RING WEARABLE BUZZER',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ] else ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const DevicePairingScreen()),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF131B2E),
                    foregroundColor: AppTheme.primaryTeal,
                    side: const BorderSide(color: AppTheme.primaryTeal),
                    minimumSize: const Size.fromHeight(52),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  icon: const Icon(Icons.bluetooth_searching_rounded, size: 20),
                  label: Text(
                    'CONNECT WEARABLE BAND',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      fontSize: 14,
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
