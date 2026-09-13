import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/auth/auth_service.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/modules/guardian/wearable_guardian_service.dart';
import 'package:samadhan_health/modules/sync/firebase_sync_service.dart';
import 'package:samadhan_health/ui/screens/auth_screen.dart';
import 'package:samadhan_health/ui/screens/home_dashboard_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseScale;
  late Animation<double> _glowOpacity;

  String _loadingMessage = 'Booting Samadhan Edge Guardian...';
  double _progress = 0.1;

  final List<String> _steps = [
    'Restoring secure user session...',
    'Checking Bluetooth adapter & auto-reconnect...',
    'Checking Location & Proximity permissions...',
    'Pre-loading telemetry cache & offline buffer...',
    'Connecting to Samadhan Cloud Database...',
    'TinyML 5-State Risk Engine ready.',
  ];

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    _pulseScale = Tween<double>(begin: 0.94, end: 1.08).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _glowOpacity = Tween<double>(begin: 0.25, end: 0.75).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _startBootSequence();
  }

  Future<void> _startBootSequence() async {
    final auth = context.read<AuthService>();
    final ble = context.read<BleGatewayService>();
    final guardian = context.read<WearableGuardianService>();
    final sync = context.read<FirebaseSyncService>();

    // Step 1: User Session
    await Future.delayed(const Duration(milliseconds: 350));
    if (!mounted) return;
    setState(() {
      _loadingMessage = _steps[0];
      _progress = 0.25;
    });

    // Step 2: Bluetooth & Auto-reconnect
    await Future.delayed(const Duration(milliseconds: 400));
    if (!mounted) return;
    setState(() {
      _loadingMessage = _steps[1];
      _progress = 0.45;
    });
    ble.autoReconnectIfConfigured();

    // Step 3: Guardian location & proximity permissions
    await Future.delayed(const Duration(milliseconds: 350));
    if (!mounted) return;
    setState(() {
      _loadingMessage = _steps[2];
      _progress = 0.65;
    });
    guardian.requestLocationAndBluetoothPermissions();

    // Step 4: Sync & cloud initialization
    await Future.delayed(const Duration(milliseconds: 350));
    if (!mounted) return;
    setState(() {
      _loadingMessage = _steps[3];
      _progress = 0.85;
    });
    if (auth.currentUser != null) {
      sync.flushOfflineBuffer(auth.currentUser!.uid);
    }

    // Step 5: Ready
    await Future.delayed(const Duration(milliseconds: 300));
    if (!mounted) return;
    setState(() {
      _loadingMessage = _steps[5];
      _progress = 1.0;
    });

    await Future.delayed(const Duration(milliseconds: 350));
    if (!mounted) return;

    final hasUser = auth.currentUser != null;

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 600),
        pageBuilder: (context, anim1, anim2) =>
            hasUser ? const HomeDashboardScreen() : const AuthScreen(),
        transitionsBuilder: (context, anim1, anim2, child) =>
            FadeTransition(opacity: anim1, child: child),
      ),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(),

                // Animated Concentric Pulsing Radar Icon
                AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    return Stack(
                      alignment: Alignment.center,
                      children: [
                        // Outer Wave Ring
                        Container(
                          width: 140 * _pulseScale.value,
                          height: 140 * _pulseScale.value,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppTheme.primaryTeal.withValues(alpha: 0.18 * (1 - _pulseController.value)),
                              width: 2,
                            ),
                          ),
                        ),
                        // Mid Wave Ring
                        Container(
                          width: 110 * _pulseScale.value,
                          height: 110 * _pulseScale.value,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppTheme.primaryTeal.withValues(alpha: 0.25 * _glowOpacity.value),
                              width: 2,
                            ),
                          ),
                        ),
                        // Core Glowing Badge
                        Container(
                          width: 84,
                          height: 84,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppTheme.primaryTeal,
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primaryTeal.withValues(alpha: 0.3),
                                blurRadius: 24,
                                spreadRadius: 4,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.monitor_heart_rounded,
                            color: Colors.white,
                            size: 42,
                          ),
                        ),
                      ],
                    );
                  },
                ),

                const SizedBox(height: 32),

                // App Title
                Text(
                  'SAMADHAN HEALTH',
                  style: GoogleFonts.outfit(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                    color: AppTheme.textPrimary,
                  ),
                ),

                const SizedBox(height: 6),

                // Subtitle
                Text(
                  'Edge-AI Wearable & Guardian Gateway',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                    color: AppTheme.textSecondary,
                    letterSpacing: 0.5,
                  ),
                ),

                const Spacer(),

                // Status Indicator Box
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.border),
                    boxShadow: AppTheme.cardShadow,
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryTeal),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              _loadingMessage,
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: AppTheme.textPrimary,
                                fontWeight: FontWeight.w500,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            '${(_progress * 100).toInt()}%',
                            style: GoogleFonts.jetBrainsMono(
                              fontSize: 11,
                              color: AppTheme.primaryTeal,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: _progress,
                          minHeight: 4,
                          backgroundColor: AppTheme.surfaceSubtle,
                          valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryTeal),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                // Medical Regulatory Compliance Tag
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.shield_outlined, size: 14, color: AppTheme.textSecondary),
                    const SizedBox(width: 6),
                    Text(
                      'ISO 13485 • ESP32-S3 BLE 5.0 Gateway',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AppTheme.textSecondary,
                        letterSpacing: 0.4,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
