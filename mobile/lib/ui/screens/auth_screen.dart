import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/auth/auth_service.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/ui/screens/home_dashboard_screen.dart';
import 'package:samadhan_health/ui/screens/register_screen.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;

  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.05),
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
        transitionsBuilder: (context, anim1, anim2, child) => FadeTransition(opacity: anim1, child: child),
      ),
    );
  }

  void _submitSignIn() async {
    if (!_formKey.currentState!.validate()) return;

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

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            child: FadeTransition(
              opacity: _fadeAnim,
              child: SlideTransition(
                position: _slideAnim,
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Brand Icon Capsule
                      Center(
                        child: Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppTheme.primaryTeal.withValues(alpha: 0.10),
                            border: Border.all(color: AppTheme.primaryTeal.withValues(alpha: 0.25), width: 1.5),
                          ),
                          child: const Icon(
                            Icons.favorite_rounded,
                            color: AppTheme.primaryTeal,
                            size: 30,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Brand Name & Subtitle
                      Text(
                        'SAMADHAN HEALTH',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.outfit(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 2.0,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceSubtle,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Text(
                            'CLINICAL WEARABLE GATEWAY',
                            style: GoogleFonts.jetBrainsMono(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 1.0,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Main Sign In Card
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: AppTheme.surface,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: AppTheme.border),
                          boxShadow: AppTheme.elevatedShadow,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              'Sign In',
                              style: GoogleFonts.outfit(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Authenticate to sync telemetry with your care team.',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 22),

                            // Email Input
                            TextFormField(
                              controller: _emailController,
                              keyboardType: TextInputType.emailAddress,
                              style: GoogleFonts.inter(color: AppTheme.textPrimary, fontSize: 14),
                              decoration: InputDecoration(
                                labelText: 'Email Address',
                                hintText: 'name@example.com',
                                prefixIcon: const Icon(Icons.alternate_email_rounded, color: AppTheme.primaryTeal, size: 20),
                                filled: true,
                                fillColor: const Color(0xFFF8FAFC),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: const BorderSide(color: AppTheme.border),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: const BorderSide(color: AppTheme.primaryTeal, width: 1.5),
                                ),
                              ),
                              validator: (v) {
                                if (v == null || v.trim().isEmpty) return 'Please enter your email';
                                if (!v.contains('@')) return 'Please enter a valid email';
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),

                            // Password Input
                            TextFormField(
                              controller: _passwordController,
                              obscureText: _obscurePassword,
                              style: GoogleFonts.inter(color: AppTheme.textPrimary, fontSize: 14),
                              decoration: InputDecoration(
                                labelText: 'Password',
                                hintText: 'Enter your password',
                                prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppTheme.primaryTeal, size: 20),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                    color: AppTheme.textMuted,
                                    size: 20,
                                  ),
                                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                                ),
                                filled: true,
                                fillColor: const Color(0xFFF8FAFC),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: const BorderSide(color: AppTheme.border),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: const BorderSide(color: AppTheme.primaryTeal, width: 1.5),
                                ),
                              ),
                              validator: (v) {
                                if (v == null || v.isEmpty) return 'Please enter your password';
                                return null;
                              },
                            ),
                            const SizedBox(height: 20),

                            // Error Banner
                            if (auth.errorMessage != null) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                decoration: BoxDecoration(
                                  color: Colors.red.withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.red.withValues(alpha: 0.25)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.error_outline_rounded, color: AppTheme.danger, size: 18),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        auth.errorMessage!,
                                        style: GoogleFonts.inter(color: AppTheme.danger, fontSize: 12),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],

                            // Primary Sign In Action
                            ElevatedButton(
                              onPressed: auth.isBusy ? null : _submitSignIn,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryTeal,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                elevation: 0,
                              ),
                              child: auth.isBusy
                                  ? const SizedBox(
                                      height: 20,
                                      width: 20,
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                    )
                                  : Text(
                                      'ENTER HEALTH GATEWAY',
                                      style: GoogleFonts.inter(
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 0.8,
                                        fontSize: 13,
                                      ),
                                    ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Route to Dedicated Register Screen
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "First time patient? ",
                            style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 13),
                          ),
                          GestureDetector(
                            onTap: () {
                              Navigator.of(context).push(
                                PageRouteBuilder(
                                  transitionDuration: const Duration(milliseconds: 350),
                                  pageBuilder: (context, anim1, anim2) => const RegisterScreen(),
                                  transitionsBuilder: (context, anim1, anim2, child) =>
                                      FadeTransition(opacity: anim1, child: child),
                                ),
                              );
                            },
                            child: Text(
                              'Register Band',
                              style: GoogleFonts.inter(
                                color: AppTheme.primaryTeal,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
