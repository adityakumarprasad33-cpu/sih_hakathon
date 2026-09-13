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

    _pulseScale = Tween<double>(begin: 0.92, end: 1.12).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _glowOpacity = Tween<double>(begin: 0.3, end: 0.85).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _startBootSequence();
  }

  Future<void> _startBootSequence() async {
    final auth = Provider.of<AuthService>(context, listen: false);
    final ble = Provider.of<BleGatewayService>(context, listen: false);
    final guardian = Provider.of<WearableGuardianService>(context, listen: false);
    final sync = Provider.of<FirebaseSyncService>(context, listen: false);

    // Link guardian to ble
    ble.setGuardianService(guardian);

    // Step 1: Session
    await _advanceStep(0, 0.25);
    await auth.loadSavedSession();
    if (auth.currentUser != null) {
      ble.setUserUid(auth.currentUser!.uid);
    }

    // Step 2: Bluetooth & Auto-reconnect
    await _advanceStep(1, 0.45);
    await ble.autoReconnectIfConfigured();

    // Step 3: Guardian Permissions
    await _advanceStep(2, 0.65);
    await guardian.checkPermissions();

    // Step 4: Database ping & Buffer preload
    await _advanceStep(3, 0.82);
    await sync.testDatabaseConnection();

    // Step 5: Risk engine and finish
    await _advanceStep(4, 0.95);
    await Future.delayed(const Duration(milliseconds: 400));
    await _advanceStep(5, 1.0);

    await Future.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 600),
        pageBuilder: (context, anim1, anim2) =>
            auth.isAuthenticated ? const HomeDashboardScreen() : const AuthScreen(),
        transitionsBuilder: (context, anim1, anim2, child) {
          return FadeTransition(opacity: anim1, child: child);
        },
      ),
    );
  }

  Future<void> _advanceStep(int stepIndex, double progress) async {
    if (!mounted) return;
    setState(() {
      
      _loadingMessage = _steps[stepIndex];
      _progress = progress;
    });
    await Future.delayed(const Duration(milliseconds: 320));
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      body: Stack(
        children: [
          // Ambient Glow Background
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppTheme.primaryTeal.withOpacity(0.18),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -80,
            left: -80,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppTheme.accentBlue.withOpacity(0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          SafeArea(
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
                                  color: AppTheme.primaryTeal.withOpacity(0.25 * (1 - _pulseController.value)),
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
                                  color: AppTheme.accentBlue.withOpacity(0.4 * _glowOpacity.value),
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
                                gradient: LinearGradient(
                                  colors: [
                                    AppTheme.primaryTeal,
                                    AppTheme.accentBlue,
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppTheme.primaryTeal.withOpacity(_glowOpacity.value * 0.7),
                                    blurRadius: 28,
                                    spreadRadius: 4,
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.monitor_heart_rounded,
                                color: Colors.white,
                                size: 44,
                              ),
                            ),
                          ],
                        );
                      },
                    ),

                    const SizedBox(height: 36),

                    // App Title
                    Text(
                      'SAMADHAN HEALTH',
                      style: GoogleFonts.outfit(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 3.5,
                        color: Colors.white,
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Subtitle
                    Text(
                      'Edge-AI Wearable & Guardian Gateway',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w400,
                        color: Colors.white60,
                        letterSpacing: 0.8,
                      ),
                    ),

                    const Spacer(),

                    // Status Indicator Box
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF131B2E),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              SizedBox(
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
                                    color: Colors.white.withOpacity(0.85),
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
                              backgroundColor: Colors.white.withOpacity(0.08),
                              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryTeal),
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
                        const Icon(Icons.shield_outlined, size: 13, color: Colors.white38),
                        const SizedBox(width: 6),
                        Text(
                          'ISO 13485 • ESP32-S3 BLE 5.0 Gateway',
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            color: Colors.white38,
                            letterSpacing: 0.6,
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
        ],
      ),
    );
  }
}
