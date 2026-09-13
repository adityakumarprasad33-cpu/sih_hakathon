import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:samadhan_health/core/theme/app_theme.dart';
import 'package:samadhan_health/modules/auth/auth_service.dart';
import 'package:samadhan_health/modules/ble/ble_gateway_service.dart';
import 'package:samadhan_health/ui/screens/home_dashboard_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

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
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _animController.dispose();
    super.dispose();
  }

  void _submitRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthService>();
    final ble = context.read<BleGatewayService>();

    final success = await auth.signUp(
      email: _emailController.text.trim(),
      password: _passwordController.text,
      displayName: _nameController.text.trim(),
      emergencyContact: _phoneController.text.trim(),
    );

    if (success && mounted && auth.currentUser != null) {
      ble.setUserUid(auth.currentUser!.uid);
      Navigator.of(context).pushAndRemoveUntil(
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 500),
          pageBuilder: (context, anim1, anim2) => const HomeDashboardScreen(),
          transitionsBuilder: (context, anim1, anim2, child) => FadeTransition(opacity: anim1, child: child),
        ),
        (route) => false,
      );
    }
  }

  InputDecoration _buildInputDecoration({
    required String label,
    required IconData icon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      labelText: label,
      labelStyle: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 13),
      prefixIcon: Icon(icon, color: AppTheme.primaryTeal, size: 20),
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: AppTheme.surfaceSubtle,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppTheme.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppTheme.primaryTeal, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.redAccent),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.only(left: 12),
          child: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.textPrimary, size: 20),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
            child: FadeTransition(
              opacity: _fadeAnim,
              child: SlideTransition(
                position: _slideAnim,
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 440),
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppTheme.border),
                    boxShadow: AppTheme.cardShadow,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header Badge & Title
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryTeal.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.person_add_rounded,
                              color: AppTheme.primaryTeal,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primaryTeal.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        'CLINICAL ENROLLMENT',
                                        style: GoogleFonts.jetBrainsMono(
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.primaryTeal,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Create Account',
                                      style: GoogleFonts.inter(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w700,
                                        color: AppTheme.textPrimary,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Register your clinical health profile',
                                  style: GoogleFonts.inter(
                                    fontSize: 13,
                                    color: AppTheme.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Registration Form
                      Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Full Name
                            TextFormField(
                              controller: _nameController,
                              keyboardType: TextInputType.name,
                              style: GoogleFonts.inter(color: AppTheme.textPrimary, fontSize: 14),
                              decoration: _buildInputDecoration(
                                label: 'Full Name (Patient / Guardian)',
                                icon: Icons.badge_outlined,
                              ),
                              validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter your full name' : null,
                            ),
                            const SizedBox(height: 14),

                            // Email Address
                            TextFormField(
                              controller: _emailController,
                              keyboardType: TextInputType.emailAddress,
                              style: GoogleFonts.inter(color: AppTheme.textPrimary, fontSize: 14),
                              decoration: _buildInputDecoration(
                                label: 'Email Address',
                                icon: Icons.email_outlined,
                              ),
                              validator: (v) {
                                if (v == null || v.trim().isEmpty) return 'Please enter your email';
                                if (!v.contains('@') || !v.contains('.')) return 'Please enter a valid email';
                                return null;
                              },
                            ),
                            const SizedBox(height: 14),

                            // Emergency Contact Phone
                            TextFormField(
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              style: GoogleFonts.inter(color: AppTheme.textPrimary, fontSize: 14),
                              decoration: _buildInputDecoration(
                                label: 'Emergency Contact Phone',
                                icon: Icons.phone_outlined,
                              ),
                              validator: (v) {
                                if (v == null || v.trim().isEmpty) return 'Please enter an emergency phone number';
                                if (v.trim().length < 7) return 'Enter a valid phone number';
                                return null;
                              },
                            ),
                            const SizedBox(height: 14),

                            // Password
                            TextFormField(
                              controller: _passwordController,
                              obscureText: _obscurePassword,
                              style: GoogleFonts.inter(color: AppTheme.textPrimary, fontSize: 14),
                              decoration: _buildInputDecoration(
                                label: 'Create Password',
                                icon: Icons.lock_outline_rounded,
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                    color: AppTheme.textSecondary,
                                    size: 20,
                                  ),
                                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                                ),
                              ),
                              validator: (v) {
                                if (v == null || v.isEmpty) return 'Please create a password';
                                if (v.length < 6) return 'Password must be at least 6 characters';
                                return null;
                              },
                            ),
                            const SizedBox(height: 14),

                            // Confirm Password
                            TextFormField(
                              controller: _confirmPasswordController,
                              obscureText: _obscureConfirmPassword,
                              style: GoogleFonts.inter(color: AppTheme.textPrimary, fontSize: 14),
                              decoration: _buildInputDecoration(
                                label: 'Confirm Password',
                                icon: Icons.lock_reset_rounded,
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscureConfirmPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                    color: AppTheme.textSecondary,
                                    size: 20,
                                  ),
                                  onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
                                ),
                              ),
                              validator: (v) {
                                if (v != _passwordController.text) return 'Passwords do not match';
                                return null;
                              },
                            ),
                            const SizedBox(height: 18),

                            // Error Banner
                            if (auth.errorMessage != null) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                decoration: BoxDecoration(
                                  color: Colors.red.shade50,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.red.shade200),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.error_outline_rounded, color: Colors.redAccent, size: 18),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        auth.errorMessage!,
                                        style: GoogleFonts.inter(color: Colors.red.shade700, fontSize: 12),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],

                            // Submit Button
                            ElevatedButton(
                              onPressed: auth.isBusy ? null : _submitRegister,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryTeal,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 15),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
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
                                      'COMPLETE REGISTRATION',
                                      style: GoogleFonts.inter(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14,
                                      ),
                                    ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Route Back to Sign In
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Already registered? ',
                            style: GoogleFonts.inter(color: AppTheme.textSecondary, fontSize: 13),
                          ),
                          GestureDetector(
                            onTap: () => Navigator.of(context).pop(),
                            child: Text(
                              'Sign In',
                              style: GoogleFonts.inter(
                                color: AppTheme.primaryTeal,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ],
                      ),
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
