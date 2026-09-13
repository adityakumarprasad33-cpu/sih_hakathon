import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/auth/auth_service.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/ui/screens/home_dashboard_screen.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({Key? key}) : super(key: key);

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> with SingleTickerProviderStateMixin {
  final _emailController = TextEditingController(text: 'aditya@samadhan.org');
  final _passwordController = TextEditingController(text: 'password123');
  bool _isSignUp = false;
  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic));

    _animController.forward();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _animController.dispose();
    super.dispose();
  }

  void _navigateToDashboard() {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 500),
        pageBuilder: (context, anim1, anim2) => const HomeDashboardScreen(),
        transitionsBuilder: (context, anim1, anim2, child) {
          return FadeTransition(opacity: anim1, child: child);
        },
      ),
    );
  }

  void _submit() async {
    final auth = context.read<AuthService>();
    final ble = context.read<BleGatewayService>();

    final success = await auth.signIn(
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );

    if (success && mounted && auth.currentUser != null) {
      ble.setUserUid(auth.currentUser!.uid);
      _navigateToDashboard();
    }
  }

  void _demoLogin() async {
    final auth = context.read<AuthService>();
    final ble = context.read<BleGatewayService>();

    final success = await auth.signInDemo();
    if (success && mounted && auth.currentUser != null) {
      ble.setUserUid(auth.currentUser!.uid);
      _navigateToDashboard();
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      body: Stack(
        children: [
          // Subtle Ambient Top Background Glow
          Positioned(
            top: -120,
            left: MediaQuery.of(context).size.width / 2 - 140,
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppTheme.primaryTeal.withOpacity(0.20),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child: SlideTransition(
                    position: _slideAnim,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // App Brand Icon
                        Center(
                          child: Container(
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: LinearGradient(
                                colors: [
                                  AppTheme.primaryTeal.withOpacity(0.2),
                                  AppTheme.accentBlue.withOpacity(0.1),
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              border: Border.all(
                                color: AppTheme.primaryTeal.withOpacity(0.4),
                                width: 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryTeal.withOpacity(0.25),
                                  blurRadius: 20,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.monitor_heart_rounded,
                              size: 40,
                              color: AppTheme.primaryTeal,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Title
                        Text(
                          'SAMADHAN HEALTH',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.outfit(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 3.0,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Hospital-Connected Smart Wearable Gateway',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: Colors.white60,
                          ),
                        ),
                        const SizedBox(height: 32),

                        // Glassmorphic Auth Form Card
                        Container(
                          padding: const EdgeInsets.all(22),
                          decoration: BoxDecoration(
                            color: const Color(0xFF131B2E),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: Colors.white12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.4),
                                blurRadius: 30,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Text(
                                _isSignUp ? 'Patient Registration' : 'Patient Secure Login',
                                style: GoogleFonts.outfit(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _isSignUp
                                    ? 'Bind your ESP32-S3 band to cloud health records'
                                    : 'Access real-time vitals and AI risk analytics',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  color: Colors.white54,
                                ),
                              ),
                              const SizedBox(height: 20),

                              // Email
                              TextField(
                                controller: _emailController,
                                keyboardType: TextInputType.emailAddress,
                                style: const TextStyle(color: Colors.white),
                                decoration: InputDecoration(
                                  labelText: 'Email Address',
                                  labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                                  prefixIcon: const Icon(Icons.email_outlined, color: AppTheme.primaryTeal, size: 20),
                                  filled: true,
                                  fillColor: const Color(0xFF0E1424),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(14),
                                    borderSide: const BorderSide(color: Colors.white12),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(14),
                                    borderSide: const BorderSide(color: AppTheme.primaryTeal, width: 1.5),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),

                              // Password
                              TextField(
                                controller: _passwordController,
                                obscureText: true,
                                style: const TextStyle(color: Colors.white),
                                decoration: InputDecoration(
                                  labelText: 'Password',
                                  labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                                  prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppTheme.primaryTeal, size: 20),
                                  filled: true,
                                  fillColor: const Color(0xFF0E1424),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(14),
                                    borderSide: const BorderSide(color: Colors.white12),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(14),
                                    borderSide: const BorderSide(color: AppTheme.primaryTeal, width: 1.5),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 20),

                              if (auth.errorMessage != null) ...[
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: Colors.red.withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: Colors.red.withOpacity(0.3)),
                                  ),
                                  child: Text(
                                    auth.errorMessage!,
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                                  ),
                                ),
                                const SizedBox(height: 16),
                              ],

                              // Primary Sign In Button
                              ElevatedButton(
                                onPressed: auth.isBusy ? null : _submit,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.primaryTeal,
                                  foregroundColor: Colors.black,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  elevation: 4,
                                ),
                                child: auth.isBusy
                                    ? const SizedBox(
                                        height: 20,
                                        width: 20,
                                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                                      )
                                    : Text(
                                        _isSignUp ? 'REGISTER WEARABLE' : 'ENTER HEALTH GATEWAY',
                                        style: GoogleFonts.inter(
                                          fontWeight: FontWeight.bold,
                                          letterSpacing: 1.0,
                                          fontSize: 13,
                                        ),
                                      ),
                              ),
                              const SizedBox(height: 12),

                              // One-Tap Demo Access Button
                              OutlinedButton(
                                onPressed: auth.isBusy ? null : _demoLogin,
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppTheme.primaryTeal,
                                  side: BorderSide(color: AppTheme.primaryTeal.withOpacity(0.4)),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.flash_on_rounded, size: 18),
                                    const SizedBox(width: 8),
                                    Text(
                                      'QUICK PATIENT DEMO ACCESS',
                                      style: GoogleFonts.inter(
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 0.5,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Toggle Sign Up / Sign In
                        TextButton(
                          onPressed: () {
                            setState(() {
                              _isSignUp = !_isSignUp;
                            });
                          },
                          child: Text(
                            _isSignUp
                                ? 'Already have an account? Sign In'
                                : 'First time patient? Register your band',
                            style: GoogleFonts.inter(
                              color: Colors.white70,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
